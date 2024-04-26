import { useContext, useEffect } from "react";
import MapboxContext from "../MapboxContext.js";
import { GeoJSONSource, Map } from "mapbox-gl";

import GeoJSONFactory from "../GeoJSONFactory";
import { Feature, Geometry } from "geojson";

const SOURCE_ID = "observer-position-source";
const LAYER_ID = "observer-position-layer";
const MARKER_ID = "observer-marker";

type ObserverProps = {
  /** A single coordinate tuple in the form: [long, lat] */
  position: number[];
};

const ObserverIcon = ({ position }: ObserverProps) => {
  const mapInstance = useContext(MapboxContext);

  const sourceData = GeoJSONFactory.point(position);

  useEffect(() => {
    createSource(mapInstance, sourceData);
  }, [mapInstance, sourceData]);

  useEffect(() => {
    createLayers(mapInstance);
  }, [mapInstance]);

  return <></>;
};

// NOTE: This could be a Marker, rather than a full geojson source and layer. This method
// simply keeps this Mapbox rendering component consistent with the other Mapbox geojson rendering components.

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
  const layer = mapInstance.getLayer(LAYER_ID);
  if (layer) return;

  mapInstance.addLayer({
    id: LAYER_ID,
    type: "symbol",
    source: SOURCE_ID,
    layout: {
      "icon-image": MARKER_ID,
      "icon-size": 0.5,
      "icon-offset": [0, -64],
    },
  });

  mapInstance.loadImage("observer.png", (err, image) => {
    // TODO: A more graceful way to fallback to another marker.

    if (err) throw err;

    if (image) {
      mapInstance.addImage(MARKER_ID, image);
    }
  });
}

export default ObserverIcon;
