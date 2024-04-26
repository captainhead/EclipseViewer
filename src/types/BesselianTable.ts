// A BesselianTable represents the Besselian polynomial coefficients and associated values.
// Not to be confused with BesselianElements.

/*
Example of a valid BesslianTable in JSON form:

{
  "date": "2024-04-08",
  
  "x": [-0.318157, 0.5117105, 0.0000326, -0.0000085],
  "y": [0.219747, 0.2709586, -0.0000594, -0.0000047],
  "d": [7.5862, 0.014844, -0.000002],
  "l1": [0.535813, 0.0000618, -0.0000128],
  "l2": [-0.010274, 0.0000615, -0.0000127],
  "mu": [89.59122, 15.004084],

  "tanF1": 0.0046683,
  "tanF2": 0.004645,

  "t0": 18,
  "tRange": [15.0, 21.0],

  "deltaT": 70.6

}

*/

type BesselianTable = {
  date: string,

  x: number[];
  y: number[];
  d: number[];
  mu: number[];
  l1: number[];
  l2: number[];

  tanF1: number;
  tanF2: number;

  t0: number;
  tRange: number[];

  deltaT: number;
};

export default BesselianTable;