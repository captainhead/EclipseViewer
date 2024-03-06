// type Coordinate = {
//   lat: number
//   long: number
// }

// type EclipseRecord = {
//   timeStamp: string
//   limitNorth: Coordinate
//   limitSouth: Coordinate
//   limitCenter: Coordinate
//   moonSunDiameterRatio: number
//   duration: string // TODO: perhaps number of seconds would be better
// }

import GeoJSON from "geojson";

const COORD_TYPES = ["limitNorth", "limitSouth", "limitCenter"];

function readLine(l) {
  let currentIndex = 0; // Store current index where string parsing has progressed.
  const result = {};

  const timeStampRegex = /^\s*((?:\d+:\d+)|Limits)/g; // Adding global flag g so the regex stores lastIndex
  const timeStampMatch = timeStampRegex.exec(l);

  if (timeStampMatch === null) {
    // Skip
    return;
  }

  currentIndex = timeStampRegex.lastIndex;
  result.timeStamp = timeStampMatch[1];

  for (let c in COORD_TYPES) {
    const { coord, nextIndex } = parseNextCoordinate(l, currentIndex);
    result[COORD_TYPES[c]] = coord;
    currentIndex = nextIndex;
  }

  const ratioRegex = /(\d+[.]\d+)/g;
  ratioRegex.lastIndex = currentIndex;
  const ratioMatch = ratioRegex.exec(l);
  currentIndex = ratioRegex.lastIndex;

  result.moonSunDiameterRatio = parseFloat(ratioMatch);

  // Skip Sun altitude, azimuth angles, and path width
  const skipRegex = /\d+\s+(?:\d+|[-])\s+\d+/g;
  skipRegex.lastIndex = currentIndex;
  skipRegex.exec(l);
  currentIndex = skipRegex.lastIndex;

  const durationRegex = /(\d+m\d+[.]\d+s)/;
  durationRegex.lastIndex = currentIndex;
  const durationMatch = durationRegex.exec(l);
  // TODO: Format into a meaningful time value for display.
  result.duration = durationMatch[1];
  // currentIndex = durationRegex.lastIndex; // No further need to maintain index, this is the end of the line.

  return result;
}

function parseNextCoordinate(l, index) {
  let i = index;

  const latRegex = /([-])|(?:(\d+) (\d+[.]\d+)([N|S]))/g;
  latRegex.lastIndex = i;
  const latMatch = latRegex.exec(l);
  if (latMatch !== null) {
    i = latRegex.lastIndex;
  }

  const longRegex = /([-])|(?:(\d+) (\d+[.]\d+)([E|W]))/g;
  longRegex.lastIndex = i;
  const longMatch = longRegex.exec(l);
  if (longMatch !== null) {
    i = longRegex.lastIndex;
  }

  let lat, long;
  if (latMatch !== null && !latMatch[1]) {
    const latDegrees = parseInt(latMatch[2]);
    const latMinutes = parseFloat(latMatch[3]);
    const latDirection = latMatch[4];
    lat = (latDegrees + latMinutes / 60) * (latDirection === "S" ? -1 : 1);
  }
  if (longMatch !== null && !longMatch[1]) {
    const longDegrees = parseInt(longMatch[2]);
    const longMinutes = parseFloat(longMatch[3]);
    const longDirection = longMatch[4];
    long = (longDegrees + longMinutes / 60) * (longDirection === "W" ? -1 : 1);
  }

  return { coord: [long, lat], nextIndex: i };
}

function parseEclipseTable(text) {
  const lines = text.split("\n");
  // console.log(lines);

  // console.log(lines.length);
  const parsedPathCordinates = lines.reduce((acc, val) => {
    const c = readLine(val);
    return c ? [...acc, c] : acc;
  }, []);
  // console.log(parsedPathCordinates);

  // TODO: This temporarily filters out points that are missing/undefined. I think these should be duplicated from previous entries.
  const path = parsedPathCordinates.filter((p) => {
    let result = true;
    for (let t in COORD_TYPES) {
      result = p[COORD_TYPES[t]].every((v) => !!v);
      if (!result) break;
    }
    return result;
  });

  return GeoJSON.parse(
    [
      {
        centerLine: path.map((c) => c.limitCenter),
      },
      {
        bounds: [
          [
            // geojson expects an array of arrays - the first array is the outer boundary, subsequent arrays would be "holes" cut out of the boundary.
            ...path.map((c) => c.limitSouth),
            ...path.map((c) => c.limitNorth).reverse(),
          ],
        ],
      },
    ],
    { LineString: "centerLine", Polygon: "bounds" }
  );
}

export default parseEclipseTable;
