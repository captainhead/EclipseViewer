import butil from "./util.js";

// Methods to compute the global features of the eclipse, such as center-line and north/south boundary of the path of the eclipse shadow.

function _solveQuadrant(sin, cos) {
  if (sin >= 0 && cos >= 0) {
    return Math.asin(sin);
  }
  if (sin < 0 && cos >= 0) {
    return Math.asin(sin);
  }
  if (sin < 0 && cos < 0) {
    return -Math.acos(cos);
  }
  if (sin >= 0 && cos < 0) {
    return Math.acos(cos);
  }
}

function _startEndTimeEstimate(d0, x0, x1, y0, y1) {
  const ome =
    1 /
    Math.sqrt(1 - butil.eSquared * Math.pow(Math.cos(butil.toRadians(d0)), 2));
  const u = x0;
  const a = x1;
  const v = ome * y0;
  const b = ome * y1;
  const n = Math.sqrt(a * a + b * b);

  const S = (a * v - u * b) / n;
  const tau = -(u * a + v * b) / (n * n);
  const dTau = Math.sqrt(1 - S * S) / n;
  const tau1 = tau - dTau;
  const tau2 = tau + dTau;

  return { tau1, tau2 };
}

function _startEndTimeRefinement(besselTable, t) {
  const besselElements = butil.calculateBesselianElements(besselTable, t);
  const xPrime = butil.applyBesselDerivative(besselTable.x, t);
  const yPrime = butil.applyBesselDerivative(besselTable.y, t);

  return _startEndTimeEstimate(
    besselElements.d,
    besselElements.x,
    xPrime,
    besselElements.y,
    yPrime
  );
}

function _computeExtremes(besselTable, t) {
  const besselElements = butil.calculateBesselianElements(besselTable, t);
  const { x, y, d, mu, l1, l2 } = besselElements;
  const xPrime = butil.applyBesselDerivative(besselTable.x, t);
  const yPrime = butil.applyBesselDerivative(besselTable.y, t);

  const ome =
    1 /
    Math.sqrt(1 - butil.eSquared * Math.pow(Math.cos(butil.toRadians(d)), 2));
  const p = besselTable.mu[1] / (180 / Math.PI);
  const b = yPrime - p * x * Math.sin(butil.toRadians(d));
  const c = xPrime + p * y * Math.sin(butil.toRadians(d));

  const y1 = ome * y;
  const b1 = ome * Math.sin(butil.toRadians(d));
  const b2 = butil.sqrtOneMinusESquared * ome * Math.cos(butil.toRadians(d));

  const BSquare = Math.max(1 - x * x - y1 * y1, 0);
  const B = Math.sqrt(BSquare);

  const phi1 = Math.asin(B * b1 + y1 * b2);
  const H = butil.toDegrees(
    _solveQuadrant(x / Math.cos(phi1), (B * b2 - y1 * b1) / Math.cos(phi1))
  );

  const phi = butil.toDegrees(
    Math.atan((1 - butil.sqrtOneMinusESquared) * Math.tan(phi1))
  );
  const lam = -(
    mu -
    H -
    butil.siderialToSynodicDayLengthFactor *
      butil.degreesPerSecondRotation *
      besselTable.deltaT
  );
  const L1p = l1 - B * besselTable.tanF1;
  const L2p = l2 - B * besselTable.tanF2;
  const a = c - p * B * Math.cos(butil.toRadians(d));
  const n = Math.sqrt(a * a + b * b);
  const duration = (7200 * L2p) / n;

  const sinh =
    Math.sin(butil.toRadians(d)) * Math.sin(butil.toRadians(phi)) +
    Math.cos(butil.toRadians(d)) *
      Math.cos(butil.toRadians(phi)) *
      Math.cos(butil.toRadians(H));
  const h = butil.toDegrees(Math.asin(sinh));

  const K2 = B * B + Math.pow(x * a + y * b, 2) / (n * n);
  const K = Math.sqrt(K2);
  const width = (((2 * butil.EarthRadius) / 1000) * Math.abs(L2p)) / K; // In units of KM.

  const A = (L1p - L2p) / (L1p + L2p);

  return {
    t,
    lam,
    duration,
    h,
    width,
    A,
  };
}

// Calculate the estimated begin/end time of the eclipse and the respective circumstances.
function computeStartEndCircumstances(besselTable) {
  const estimate = _startEndTimeEstimate(
    besselTable.d[0],
    besselTable.x[0],
    besselTable.x[1],
    besselTable.y[0],
    besselTable.y[1]
  );

  const beginEstimate = _startEndTimeRefinement(besselTable, estimate.tau1);
  const endEstimate = _startEndTimeRefinement(besselTable, estimate.tau2);

  const beginCircumstances = _computeExtremes(
    besselTable,
    estimate.tau1 + beginEstimate.tau1
  );
  const endCircumstances = _computeExtremes(
    besselTable,
    estimate.tau2 + endEstimate.tau2
  );

  return { beginCircumstances, endCircumstances };
}

// Determine the northern or southern limits of the eclipse path at a given longitude.
// direction - "north" or "south"
// shadowType - "umbra" or "penumbra"
function computePathLimitAtLongitude(
  besselTable,
  longitude,
  direction,
  shadowType,
  startPhi
) {
  const lam = longitude;
  let phi = startPhi;
  let i = 0;
  let deltaPhi = 1000;
  let tau = 1000;
  let t = 0;

  while ((Math.abs(tau) > 0.0001 || Math.abs(deltaPhi) > 0.0001) && i < 20) {
    const besselElements = butil.calculateBesselianElements(besselTable, t);
    const { x, y, d, mu, l1, l2 } = besselElements;
    const xPrime = butil.applyBesselDerivative(besselTable.x, t);
    const yPrime = butil.applyBesselDerivative(besselTable.y, t);

    const H =
      mu +
      lam -
      butil.siderialToSynodicDayLengthFactor *
        butil.degreesPerSecondRotation *
        besselTable.deltaT;

    const height = 0; // TODO: Is it useful to factor in altitude?
    const u1 = butil.toDegrees(
      Math.atan(butil.sqrtOneMinusESquared * Math.tan(butil.toRadians(phi)))
    );
    const rhoSinPhiP =
      butil.sqrtOneMinusESquared * Math.sin(butil.toRadians(u1)) +
      (height / butil.EarthRadius) * Math.sin(butil.toRadians(phi));
    const rhoCosPhiP =
      Math.cos(butil.toRadians(u1)) +
      (height / butil.EarthRadius) * Math.cos(butil.toRadians(phi));

    const eps = rhoCosPhiP * Math.sin(butil.toRadians(H));
    const eta =
      rhoSinPhiP * Math.cos(butil.toRadians(d)) -
      rhoCosPhiP * Math.cos(butil.toRadians(H)) * Math.sin(butil.toRadians(d));
    const zet =
      rhoSinPhiP * Math.sin(butil.toRadians(d)) +
      rhoCosPhiP * Math.cos(butil.toRadians(H) * Math.cos(butil.toRadians(d)));
    const epsP = butil.toRadians(
      besselTable.mu[1] * rhoCosPhiP * Math.cos(butil.toRadians(H))
    );
    const etaP = butil.toRadians(
      besselTable.mu[1] * eps * Math.sin(butil.toRadians(d)) -
        zet * besselTable.d[1]
    );
    const L1p = l1 - zet * besselTable.tanF1;
    const L2p = l2 - zet * besselTable.tanF2;

    const u = x - eps;
    const v = y - eta;
    const a = xPrime - epsP;
    const b = yPrime - etaP;
    const n = Math.sqrt(a * a + b * b);

    const W = (v * a - u * b) / n;
    const Q =
      (b * Math.sin(butil.toRadians(H)) * rhoSinPhiP +
        a *
          (Math.cos(butil.toRadians(H)) *
            Math.sin(butil.toRadians(d)) *
            rhoSinPhiP +
            Math.cos(butil.toRadians(d)) * rhoCosPhiP)) /
      butil.toDegrees(n);

    const E = L1p - (shadowType === "umbra" ? 1 : 0) * (L1p + L2p);

    tau = -(u * a + v * b) / (n * n);
    deltaPhi = (W + (direction === "north" ? 1 : -1) * Math.abs(E)) / Q;

    t = t + tau;
    phi = phi + deltaPhi;
    i++;
  }

  if (Math.abs(tau) > 0.0001 || Math.abs(deltaPhi) > 0.0001) return null;

  phi = (90 + phi) % 180;
  if (phi < 0) phi += 180;
  phi -= 90;

  return { t, lat: phi, lon: lam };
}

// Compute a poly-line representing the northern- or southern-most boundary of the umbral or penumbral shadow.
// direction - "north" or "south"
// shadowType - "umbra" or "penumbra"
function computePathLimitLine(
  besselTable,
  beginLon,
  endLon,
  direction,
  shadowType
) {
  const eqPoints = [];
  // const polarPoints = [];
  const lonStep = 0.5; // TODO: Original suggested step was 0.01
  for (let lon = beginLon; lon < endLon; lon += lonStep) {
    const eq = computePathLimitAtLongitude(
      besselTable,
      lon,
      direction,
      shadowType,
      0
    );
    const polar = computePathLimitAtLongitude(
      besselTable,
      lon,
      direction,
      shadowType,
      89.9 * Math.sign(besselTable.y[0])
    );

    if (polar != null && eq != null) {
      if (Math.abs(eq.lat - polar.lat) < 0.1) {
        eqPoints.push(eq);
      } else {
        eqPoints.push(eq);
        // polarPoints.push(polar);
      }
    } else {
      eqPoints.push(null);
      // polarPoints.push(null);
    }
  }

  // TODO: "polarPoints" appeared in the texts but does not appear to be necessary for drawing limit lines
  //   return [eqPoints, polarPoints];
  return eqPoints;
}

// Determine the bounding box and center around the umbral shadow's limits.
function _getBounds(umbraLimitNorth, umbraLimitSouth) {
  const northStart = umbraLimitNorth.at(0);
  const northMiddle = umbraLimitNorth.at(umbraLimitNorth.length / 2);
  const northEnd = umbraLimitNorth.at(-1);
  const southStart = umbraLimitSouth.at(0);
  const southMiddle = umbraLimitSouth.at(umbraLimitSouth.length / 2);
  const southEnd = umbraLimitSouth.at(-1);

  const lon = [
    northStart.lon,
    northMiddle.lon,
    northEnd.lon,
    southStart.lon,
    southMiddle.lon,
    southEnd.lon,
  ];
  const lat = [
    northStart.lat,
    northMiddle.lat,
    northEnd.lat,
    southStart.lat,
    southMiddle.lat,
    southEnd.lat,
  ];
  const minLon = Math.min(...lon);
  const maxLon = Math.max(...lon);
  const minLat = Math.min(...lat);
  const maxLat = Math.max(...lat);

  return {
    limits: [
      [minLon, minLat],
      [maxLon, maxLat],
    ],
    center: [
      (northMiddle.lon + southMiddle.lon) / 2,
      (northMiddle.lat + southMiddle.lat) / 2,
    ],
  };
}

function computeGlobalEclipseCircumstances(besselTable) {
  const { beginCircumstances, endCircumstances } =
    computeStartEndCircumstances(besselTable);

  const umbraLimitNorth = computePathLimitLine(
    besselTable,
    beginCircumstances.lam,
    endCircumstances.lam,
    "north",
    "umbra"
  );

  const umbraLimitSouth = computePathLimitLine(
    besselTable,
    beginCircumstances.lam,
    endCircumstances.lam,
    "south",
    "umbra"
  );

  const {limits, center} = _getBounds(umbraLimitNorth, umbraLimitSouth);

  return {
    beginTime: beginCircumstances.t,
    endTime: endCircumstances.t,
    umbraLimitNorth,
    umbraLimitSouth,
    bounds: limits,
    center: center,
  };
}

export default { computeGlobalEclipseCircumstances };
