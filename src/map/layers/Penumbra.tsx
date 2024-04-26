import { useContext, useEffect } from "react";
import MapboxContext from "../MapboxContext.js";
import { GeoJSONSource, Map } from "mapbox-gl";

import GeoJSONFactory from "../GeoJSONFactory";
import { Feature, Geometry } from "geojson";

const SOURCE_ID = "eclipse-penumbra-outline";
const FILL_LAYER_ID = "eclipse-penumbra-outline-fill";
const STROKE_LAYER_ID = "eclipse-penumbra-outline-stroke";

type PenumbraProps = {
  /** A list of coordinate tuples in the form: [ [long, lat], [long, lat], ... ] */
  outlineCoordinates: number[][];
};

const Penumbra = ({ outlineCoordinates }: PenumbraProps) => {
  const mapInstance = useContext(MapboxContext);

  const sourceData = GeoJSONFactory.polygon(outlineCoordinates);

  useEffect(() => {
    createSource(mapInstance, sourceData);
  }, [mapInstance, sourceData]);

  useEffect(() => {
    createLayers(mapInstance);
  }, [mapInstance]);

  return <></>;
};

function createSource(mapInstance: Map, sourceData: Feature<Geometry>) {
  const source = mapInstance.getSource(SOURCE_ID) as GeoJSONSource;
  if (!source) {
    mapInstance.addSource(SOURCE_ID, {
      type: "geojson",
      data: sourceData,
    });
  } else {
    source.setData(sourceData);
  }
}

function createLayers(mapInstance: Map) {
  // Skip creating the mapbox layer if it already exists. This can occur if React unmounts/mounts the component while the Mapbox instance still exists.
  const layer = mapInstance.getLayer(FILL_LAYER_ID);
  if (layer) return;

  mapInstance.addLayer({
    id: FILL_LAYER_ID,
    type: "fill",
    source: SOURCE_ID,
    paint: {
      "fill-color": "#444",
      "fill-opacity": 0.2,
    },
  });

  mapInstance.addLayer({
    id: STROKE_LAYER_ID,
    type: "line",
    source: SOURCE_ID,
    paint: {
      "line-color": "#222",
      "line-width": 1,
    },
  });
}

export default Penumbra;
