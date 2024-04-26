// These functions calculate the curve defining the outline of the umbra and/or penumbra of the shadow cast by a solar eclipse.
// The resulting curve is represented as an array of [longitude, latitude] coordinates intended for use with GeoJSON polygons. 

import butil from "./util.js";
const {
  eSquared,
  siderialToSynodicDayLengthFactor,
  degreesPerSecondRotation,

  toRadians,
  toDegrees,
  moduloPositive,
} = butil;

// Methods to compute the position/outline polygon where the umbra or penumbra boundary appears on the Earth's surface.

// Compute an intersection with the shadow outline by projecting a line from x,y with angle Q from the vertical y-axis
function shadowOutlinePoint(besselElements, Q, shadowType = "umbra") {
  const sind = Math.sin(toRadians(besselElements.d));
  const cosd = Math.cos(toRadians(besselElements.d));
  const rho1 = Math.sqrt(1 - eSquared * cosd * cosd);
  const rho2 = Math.sqrt(1 - eSquared * sind * sind);
  const sind1 = sind / rho1;
  const cosd1 = (Math.sqrt(1 - eSquared) * cosd) / rho1;
  const sind1d2 = (eSquared * sind * cosd) / (rho1 * rho2);
  const cosd1d2 = Math.sqrt(1 - eSquared) / (rho1 * rho2);

  const angleQ = toRadians(Q);
  const sinQ = Math.sin(angleQ);
  const cosQ = Math.cos(angleQ);

  const l = shadowType === "umbra" ? besselElements.l2 : besselElements.l1;
  const tanf =
    shadowType === "umbra" ? besselElements.tanF2 : besselElements.tanF1;

  // Begin iteration
  // This iterates until convergence (texts suggest result should be sufficient after ~3 iterations)
  let L = l;
  let eps, eta, zet1, zet;

  for (let i = 0; i < 3; i++) {
    eps = besselElements.x - L * sinQ;
    eta = (besselElements.y - L * cosQ) / rho1;
    zet1 = Math.sqrt(1 - eps * eps - eta * eta);

    zet = rho2 * (zet1 * cosd1d2 - eta * sind1d2);
    L = l - zet * tanf;
  }
  // End iteration

  const cosPhi1SinThe = eps;
  const cosPhi1CosThe = zet1 * cosd1 - eta * sind1;
  const the = toDegrees(Math.atan2(cosPhi1SinThe, cosPhi1CosThe));
  const lam =
    besselElements.mu -
    siderialToSynodicDayLengthFactor *
      degreesPerSecondRotation *
      besselElements.deltaT -
    the;
  const phi1 = Math.asin(eta * cosd1 + zet1 * sind1);
  const phi = toDegrees(
    Math.atan((1 / Math.sqrt(1 - eSquared)) * Math.tan(phi1))
  );

  return {
    lat: phi > 90 ? phi - 180 : phi < -90 ? phi + 180 : phi,
    long: -(lam > 180 ? lam - 360 : lam),
  };
}

// Generate the polygon vertices representing the umbral or penumbral boundary outline.
function shadowOutlinePath(besselElements, shadowType = "umbra") {
  const computedAngleRange = shadowOutlineCurveAngleRange(
    besselElements,
    shadowType
  );
  const baseAngleRange = [computedAngleRange.start, computedAngleRange.end];

  // Due to floating point error, the start/end angle range can produce a point not on the Earth's surface. Attempt to converge to a valid starting/ending angle.
  let pStart = shadowOutlinePoint(besselElements, baseAngleRange[0], shadowType);
  let qStartDelta = 0;
  while ((isNaN(pStart.lat) || isNaN(pStart.long)) && qStartDelta < 0.3) {
    pStart = shadowOutlinePoint(
      besselElements,
      baseAngleRange[0] + qStartDelta,
      shadowType
    );
    qStartDelta += 0.001;
  }

  let pEnd = shadowOutlinePoint(besselElements, baseAngleRange[1], shadowType);
  let qEndDelta = 0;
  while ((isNaN(pEnd.lat) || isNaN(pEnd.long)) && qEndDelta < 0.3) {
    pEnd = shadowOutlinePoint(
      besselElements,
      baseAngleRange[1] - qEndDelta,
      shadowType
    );
    qEndDelta += 0.001;
  }

  const angleRange = [
    baseAngleRange[0] + qStartDelta,
    baseAngleRange[1] - qEndDelta,
  ];

  // Generate a list of angles in "angleStep" increments between the start/end angle range.
  const angleStep = 1;
  const angleList = Array.from(
    { length: (angleRange[1] - angleRange[0]) / angleStep + 1 },
    (_v, index) => angleRange[0] + index * angleStep
  );

  const result = angleList
    .filter((Q) => Q > angleRange[0] && Q < angleRange[1]) // Remove any angles beyond or equal to the boundary angles, since these points will be added based on the pStart and pEnd points above.
    .map((Q) => shadowOutlinePoint(besselElements, Q, shadowType));

  result.unshift(pStart);
  result.push(pEnd);

  if (angleRange[1] - angleRange[0] < 360) {
    // This "closes" the polygon back to its starting point. Without this point, mapbox will not draw a stroke to close the polygon.
    // This is not necessary when range is 0..360 since 0 and 360 result in the same point, thus closing the polygon.
    result.push(result[0]);
  }

  // In case the above search for NaN positions still lets one slip through, filter them out to prevent rendering artifacts.
  return result.filter(({ long, lat }) => !isNaN(long) && !isNaN(lat));
}

// Determine the range of angles (e.g. [0, 360]) around the x,y shadow axis point where the boundary/outline of the shadow lays on a part of the earth that is facing *toward* the sun, i.e. the illuminated side where a shadow could fall during the solar eclipse.
function shadowOutlineCurveAngleRange(besselElements, shadowType = "umbra") {
  const { x, y, l1, l2 } = besselElements;
  const l = shadowType === "umbra" ? l2 : l1;
  const m = Math.sqrt(x * x + y * y);
  const M = Math.atan2(x, y);
  const cosQM = (m * m + l * l - 1) / (2 * m * l);
  const QM = Math.acos(cosQM);
  const Q1rad = QM + M;
  const Q2rad = -QM + M;
  let Q1 = moduloPositive(toDegrees(Q1rad), 360);
  let Q2 = moduloPositive(toDegrees(Q2rad), 360);

  if (isNaN(Q1) || isNaN(Q2)) {
    Q2 = 0;
    Q1 = 360;
  } else {
    Q2 = Q2 + 0.4;
    Q1 = (Q1 < Q2 ? Q1 + 360 : Q1) - 0.4;
  }

  return { start: Q2, end: Q1 };
}

export default {
  shadowOutlinePath,
};
