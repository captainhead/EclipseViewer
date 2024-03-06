import mapboxgl from "mapbox-gl";
import GeoJSON from "geojson";

import "mapbox-gl/dist/mapbox-gl.css";

const COORD_REGEX = /(\d+) (\d+[.]\d+)([N|S]) (\d+) (\d+[.]\d+)([E|W])/;
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

  for (c in COORD_TYPES) {
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

// Test loading the file and splitting into lines
const pathCoordinatesPromise = fetch("./resources/path_coordinates.txt")
  // const pathCoordinatesPromise = fetch("./resources/2021-12-04.txt")
  // const pathCoordinatesPromise = fetch("./resources/2017-08-21.txt")
  .then((r) => r.text())
  .then((text) => {
    const lines = text.split("\n");
    // console.log(lines);

    // console.log(lines.length);
    const parsedPathCordinates = lines.reduce((acc, val) => {
      const c = readLine(val);
      return c ? [...acc, c] : acc;
    }, []);
    // console.log(parsedPathCordinates);

    // TODO: This temporarily filters out points that are missing/undefined
    const path = parsedPathCordinates.filter((p) => {
      let result = true;
      for (t in COORD_TYPES) {
        result = p[COORD_TYPES[t]].every((v) => !!v);
        if (!result) break;
      }
      return result;
    });
    // console.log(path);

    return path;
  })
  .then((p) => {
    return GeoJSON.parse(
      [
        {
          centerLine: p.map((c) => c.limitCenter),
        },
        {
          bounds: [
            [
              // geojson expects an array of arrays - the first array is the outer boundary, subsequent arrays would be "holes" cut out of the boundary.
              ...p.map((c) => c.limitSouth),
              ...p.map((c) => c.limitNorth).reverse(),
            ],
          ],
        },
      ],
      { LineString: "centerLine", Polygon: "bounds" }
    );

    // return GeoJSON.parse(
    //   {
    //     centerLine: p.map((c) => c.limitCenter),
    //   },
    //   { LineString: "centerLine" }
    // );
  });

// const FULL_LINE_REGEX =
//   /(\s*(\d+) (\d+[.]\d+)([N|S]) (\d+) (\d+[.]\d+)([E|W])\s*){3}/;

// const fullLine =
//   " 16:42   05 30.6S 149 47.6W  06 11.7S 146 38.0W  05 50.2S 148 07.8W  1.043  11  81  159  02m27.5s";
// const fullLine2 =
//   " Limits  07 11.6S 158 43.9W  08 27.2S 158 20.1W  07 49.5S 158 31.9W  1.040   0   -  144  02m06.3s";
// const fullLine3 =
//   "                                                                      M:S                 Central";
// const fullLine4 =
//   "Universal  Northern Limit      Southern Limit       Central Line     Diam.  Sun Sun Path   Line";
// const fullLine5 =
//   "16:40      -         -      07 36.2S 152 54.5W  07 38.1S 157 11.2W  1.040   1  82  146  02m08.8s";

// let result;
// while ((result = FULL_LINE_REGEX.exec(fullLine)) !== null) {
//   console.log(`Found ${result[0]}`);
// }
// const testMatch = FULL_LINE_REGEX.exec(fullLine);
// console.log(testMatch);

// console.log(readLine(fullLine));
// console.log(readLine(fullLine2));
// console.log(readLine(fullLine3));
// console.log(readLine(fullLine4));
// console.log(readLine(fullLine5));

// function readLine(l) {
//   let currentIndex = 0; // Store current index where string parsing has progressed.
//   const result = {};

//   const timeStampRegex = /^\s*((?:\d+:\d+)|Limits)/g; // Adding global flag g so the regex stores lastIndex
//   const timeStampMatch = timeStampRegex.exec(l);

//   if (timeStampMatch === null) {
//     // Skip
//     return;
//   }

//   currentIndex = timeStampRegex.lastIndex;
//   result.timeStamp = timeStampMatch[1];

//   for (c in COORD_TYPES) {
//     // const coordRegex =
//     //   /(\d+) (\d+[.]\d+)([N|S]) (\d+) (\d+[.]\d+)([E|W])/g;
//     // coordRegex.lastIndex = currentIndex;
//     // const coord = coordRegex.exec(l);
//     // currentIndex = coordRegex.lastIndex;
//     const { coord, nextIndex } = parseNextCoordinate(l, currentIndex);
//     result[COORD_TYPES[c]] = coord;
//     currentIndex = nextIndex;
//   }

//   const ratioRegex = /(\d+[.]\d+)/g;
//   ratioRegex.lastIndex = currentIndex;
//   const ratioMatch = ratioRegex.exec(l);
//   currentIndex = ratioRegex.lastIndex;

//   result.moonSunDiameterRatio = parseFloat(ratioMatch);

//   // Skip Sun altitude, azimuth angles, and path width
//   const skipRegex = /\d+\s+(?:\d+|[-])\s+\d+/g;
//   skipRegex.lastIndex = currentIndex;
//   skipRegex.exec(l);
//   currentIndex = skipRegex.lastIndex;

//   const durationRegex = /(\d+m\d+[.]\d+s)/;
//   durationRegex.lastIndex = currentIndex;
//   const durationMatch = durationRegex.exec(l);
//   // TODO: Format into a meaningful time value for display.
//   result.duration = durationMatch[1];
//   // currentIndex = durationRegex.lastIndex;

//   return result;
// }

// function parseNextCoordinate(l, index) {
//   // const coordRegex = /(\d+) (\d+[.]\d+)([N|S]) (\d+) (\d+[.]\d+)([E|W])/g; // Remember the g flag causes the match to store 'lastIndex'.
//   // coordRegex.lastIndex = index;
//   // const coordMatch = coordRegex.exec(l);

//   let i = index;

//   const latRegex = /([-])|(?:(\d+) (\d+[.]\d+)([N|S]))/g;
//   latRegex.lastIndex = i;
//   const latMatch = latRegex.exec(l);
//   if (latMatch !== null) {
//     i = latRegex.lastIndex;
//   }

//   const longRegex = /([-])|(?:(\d+) (\d+[.]\d+)([E|W]))/g;
//   longRegex.lastIndex = i;
//   const longMatch = longRegex.exec(l);
//   if (longMatch !== null) {
//     i = longRegex.lastIndex;
//   }

//   // const latDegrees = parseInt(coordMatch[1]);
//   // const latMinutes = parseFloat(coordMatch[2]);
//   // const latDirection = coordMatch[3];
//   // const longDegrees = parseInt(coordMatch[4]);
//   // const longMinutes = parseFloat(coordMatch[5]);
//   // const longDirection = coordMatch[6];

//   let lat, long;
//   if (latMatch !== null && !latMatch[1]) {
//     const latDegrees = parseInt(latMatch[2]);
//     const latMinutes = parseFloat(latMatch[3]);
//     const latDirection = latMatch[4];
//     lat =
//       (latDegrees + latMinutes / 60) * (latDirection === "S" ? -1 : 1);
//   }
//   if (longMatch !== null && !longMatch[1]) {
//     const longDegrees = parseInt(longMatch[2]);
//     const longMinutes = parseFloat(longMatch[3]);
//     const longDirection = longMatch[4];
//     long =
//       (longDegrees + longMinutes / 60) * (longDirection === "W" ? -1 : 1);
//   }

//   // return { coord: [long, lat], nextIndex: coordRegex.lastIndex };

//   return { coord: [long, lat], nextIndex: i };
// }

// function convertCoordStringToLongLat(c) {
//   // Convert a coordinate of the form "07 49.5S 158 31.9W" (degrees minutes)
//   // to decimal degrees in an array of the form [longitude, latitude].

//   const result = COORD_REGEX.exec(c);

//   let lat =
//     (parseInt(result[1]) + parseFloat(result[2]) / 60) *
//     (result[3] === "S" ? -1 : 1);
//   let long =
//     (parseInt(result[4]) + parseFloat(result[5]) / 60) *
//     (result[6] === "W" ? -1 : 1);

//   return [long, lat];
// }

// const centralLineStart = "07 49.5S 158 31.9W";
// const centralLineEnd = "47 37.0N 019 47.2W";

// const startCoord = convertCoordStringToLongLat(centralLineStart);
// const endCoord = convertCoordStringToLongLat(centralLineEnd);

// const geoData = {
//   line: [startCoord, endCoord],
// };

// const geojsonCenterLine = GeoJSON.parse(geoData, { LineString: "line" });

mapboxgl.accessToken =
  "pk.eyJ1Ijoia2l0bGl0dGxlIiwiYSI6ImNpdDI3b3NpYjBzbjUydXFwMDJlMzF6Y2sifQ.Qx2RhMP8j2VfFUvOuA1I7A";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/outdoors-v12",
  // style: "mapbox://styles/mapbox/satellite-streets-v12",
  projection: "globe", // Display the map as a globe, since satellite-v9 defaults to Mercator
  zoom: 1,
  center: [270, 45],
});

map.on("style.load", () => {
  map.setFog({}); // Set the default atmosphere style
});

map.on("load", () => {
  // map.addSource("center-line-sample", {
  //   type: "geojson",
  //   data: geojsonCenterLine,
  // });

  // map.addLayer({
  //   id: "center-line-sample",
  //   type: "line",
  //   source: "center-line-sample",
  //   layout: {
  //     "line-join": "round",
  //     "line-cap": "round",
  //   },
  //   paint: {
  //     "line-color": "#888",
  //     "line-width": 8,
  //   },
  // });

  pathCoordinatesPromise.then((p) => {
    console.log(p);

    map.addSource("path-geojson", {
      type: "geojson",
      data: p,
    });

    map.addLayer({
      id: "umbra-extent",
      type: "fill",
      source: "path-geojson",
      paint: {
        "fill-color": "#888888",
        "fill-opacity": 0.7,
      },
      filter: ["==", "$type", "Polygon"],
    });

    map.addLayer({
      id: "center-line",
      type: "line",
      source: "path-geojson",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#444",
        // "line-width": 8,
        // Line width interpolation based on zoom level - https://github.com/mapbox/mapbox-gl-js/issues/5861#issuecomment-352033339
        "line-width": [
          "interpolate",
          ["exponential", 2],
          ["zoom"],
          10,
          ["*", 200, ["^", 2, -6]],
          24,
          ["*", 200, ["^", 2, 8]],
        ],
      },
      filter: ["==", "$type", "LineString"],
    });

    // map.addLayer({
    //   id: "umbra",
    //   type: "fill",
    //   source: "path-geojson",
    //   paint: {
    //     "fill-color": "#444",
    //     "fill-opacity": 0.5
    //   },
    //   'filter': ['==', '$type', 'Polygon']
    // });
  });
});
