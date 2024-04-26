// Collection of factory methods to build GeoJSON features from geographic coordinates.

import type { Feature, Geometry } from "geojson";

function polygon(coords: number[][]): Feature<Geometry> {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coords],
    },
    properties: null,
  };
}

function lineString(coords: number[][]): Feature<Geometry> {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: coords,
    },
    properties: null,
  };
}

function point(point: number[]): Feature<Geometry> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: point,
    },
    properties: null,
  };
}

export default {
  polygon,
  lineString,
  point,
};
