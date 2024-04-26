import { useContext, useEffect } from "react";
import MapboxContext from "../MapboxContext.js";
import { GeoJSONSource, Map } from "mapbox-gl";

import GeoJSONFactory from "../GeoJSONFactory";
import { Feature, Geometry } from "geojson";

const SOURCE_ID_PREFIX = "eclipse-path";
const STROKE_LAYER_ID_PREFIX = "eclipse-path-stroke";

const SOURCE_ID_NORTH = `${SOURCE_ID_PREFIX}-north`;
const SOURCE_ID_SOUTH = `${SOURCE_ID_PREFIX}-south`;
const STROKE_LAYER_ID_NORTH = `${STROKE_LAYER_ID_PREFIX}-north`;
const STROKE_LAYER_ID_SOUTH = `${STROKE_LAYER_ID_PREFIX}-south`;

type PathProps = {
  /** A list of coordinate tuples in the form: [ [long, lat], [long, lat], ... ] */
  northLine: number[][];
  /** A list of coordinate tuples in the form: [ [long, lat], [long, lat], ... ] */
  southLine: number[][];
};

const Path = ({ northLine, southLine }: PathProps) => {
  const mapInstance = useContext(MapboxContext);

  const northLineData = GeoJSONFactory.lineString(northLine);
  const southLineData = GeoJSONFactory.lineString(southLine);

  useEffect(() => {
    createSources(mapInstance, northLineData, southLineData);
  }, [mapInstance, northLineData, southLineData]);

  useEffect(() => {
    createLayers(mapInstance);
  }, [mapInstance]);

  return <></>;
};

function createSources(
  mapInstance: Map,
  northLineData: Feature<Geometry>,
  southLineData: Feature<Geometry>
) {
  const northSource = mapInstance.getSource(SOURCE_ID_NORTH) as GeoJSONSource;
  if (!northSource) {
    mapInstance.addSource(SOURCE_ID_NORTH, {
      type: "geojson",
      data: northLineData,
    });
  } else {
    northSource.setData(northLineData);
  }

  const southSource = mapInstance.getSource(SOURCE_ID_SOUTH) as GeoJSONSource;
  if (!southSource) {
    mapInstance.addSource(SOURCE_ID_SOUTH, {
      type: "geojson",
      data: southLineData,
    });
  } else {
    southSource.setData(southLineData);
  }
}

function createLayers(mapInstance: Map) {
  // Skip creating the mapbox layer if it already exists. This can occur if React unmounts/mounts the component while the Mapbox instance still exists.
  if (mapInstance.getLayer(STROKE_LAYER_ID_NORTH)) return;

  mapInstance.addLayer({
    id: STROKE_LAYER_ID_NORTH,
    type: "line",
    source: SOURCE_ID_NORTH,
    paint: {
      "line-color": "#222",
      "line-width": 1,
    },
  });

  mapInstance.addLayer({
    id: STROKE_LAYER_ID_SOUTH,
    type: "line",
    source: SOURCE_ID_SOUTH,
    paint: {
      "line-color": "#222",
      "line-width": 1,
    },
  });
}

export default Path;
