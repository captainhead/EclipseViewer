// A BesselianElements object represents the BesselianTable polynomial values when computed for a given time t. 

type BesselianElements = {
    t: number;

    x: number;
    y: number;
    d: number;
    mu: number;
    l1: number;
    l2: number;
  
    tanF1: number;
    tanF2: number;
  
    t0: number;
    tRange: number[];
  
    deltaT: number;
}

export default BesselianElements;