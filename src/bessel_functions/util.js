// Assume Earth equatorial radius of 6,378,137 m
const EarthRadius = 6378137;

// e^2 = 1 - (b^2/a^2) where a = equator radius and b = pole radius
//const eSquared = 0.00669438; // Value retrieved from German Bessel wikipedia.
const eSquared = 0.00672267; // Value retrieved from celestialprogramming.com
const sqrtOneMinusESquared = Math.sqrt(1 - eSquared); // 0.9966329966
const siderialToSynodicDayLengthFactor = 1.002738;
const degreesPerSecondRotation = 360 / 86400;
// siderialToSynodicDayLengthFactor * degreesPerSecondRotation = 0.00417807

const toRadians = (d) => d * (Math.PI / 180); // 1 degree == 0.01745329 radians
const toDegrees = (r) => r * (180 / Math.PI); // 1 radian == 57.29578 degrees
// modulo function where negative values are wrapped around to positive values < modulus
const moduloPositive = (value, modulus) =>
  ((value % modulus) + modulus) % modulus;

// Compute the value at time t for the given list of polynomial coefficients.
function applyBesselPolynomial(coefficientList, t) {
  return coefficientList.reduce(
    (acc, val, index) => acc + val * Math.pow(t, index),
    0
  );
}

// Compute the derivative value at time t. Recall polynomial x4t^3 + x3t^2 + x2t + x1 has derivative 3*x4t^2 + 2*x3t + x2
function applyBesselDerivative(coefficientList, t) {
  return coefficientList
    .slice(1)
    .reduce(
      (acc, val, index) => acc + (index + 1) * val * Math.pow(t, index),
      0
    );
}

// Given a table of Besselian coefficients, compute the Besselian elements for a given time in hours.
function calculateBesselianElements(besselTable, t) {
  const { x, y, d, l1, l2, mu, tanF1, tanF2, t0, tRange, deltaT } = besselTable;
  const coefficientLists = [x, y, d, l1, l2, mu];
  const elements = coefficientLists.map((c) => applyBesselPolynomial(c, t));
  return {
    t,
    x: elements[0],
    y: elements[1],
    d: elements[2],
    mu: elements[5],
    l1: elements[3],
    l2: elements[4],

    // For convenience, copy scalar values along with computed elements.
    tanF1,
    tanF2,
    t0,
    tRange,
    deltaT,
  };
}

export default {
  EarthRadius,
  eSquared,
  sqrtOneMinusESquared,
  siderialToSynodicDayLengthFactor,
  degreesPerSecondRotation,

  toRadians,
  toDegrees,
  moduloPositive,

  calculateBesselianElements,
  applyBesselDerivative
};
