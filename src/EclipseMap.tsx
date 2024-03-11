// @ts-ignore no-unused-vars React
import React, { useRef, useEffect, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./EclipseMap.module.css";

const DEFAULT_ZOOM = 3;
const TRANSITION_DURATION_CHANGE_ECLIPSE = 2000;

function mapInit(container: HTMLElement, onLoad) {
  mapboxgl.accessToken =
    "pk.eyJ1Ijoia2l0bGl0dGxlIiwiYSI6ImNpdDI3b3NpYjBzbjUydXFwMDJlMzF6Y2sifQ.Qx2RhMP8j2VfFUvOuA1I7A";

  const m: Map = new mapboxgl.Map({
    container: container,
    style: "mapbox://styles/mapbox/outdoors-v12",
    // style: "mapbox://styles/mapbox/satellite-streets-v12",
    // center: [-90, 45],
    zoom: DEFAULT_ZOOM,
  });

  m.on("style.load", () => {
    m.setFog({}); // Set the default atmosphere style
  });

  m.on("load", onLoad);

  return m;
}

function mapUpdateEclipsePath(map: Map, eclipsePath) {
  console.log("update", eclipsePath);

  const source = map.getSource("eclipse-path-geojson");
  if (source) {
    source.setData(eclipsePath);
  } else {
    map.addSource("eclipse-path-geojson", {
      type: "geojson",
      data: eclipsePath,
    });
  }

  if (!map.getLayer("eclipse-umbra-extent")) {
    // Render polygon along path of eclipse with outline and transparent fill
    map.addLayer({
      id: "eclipse-umbra-extent",
      type: "fill",
      source: "eclipse-path-geojson",
      paint: {
        "fill-color": "#888",
        "fill-opacity": 0.7,
      },
      filter: ["==", "$type", "Polygon"],
    });

    map.addLayer({
      id: "eclipse-umbra-extent-outline",
      type: "line",
      source: "eclipse-path-geojson",
      paint: {
        "line-color": "#444",
        // "line-opacity": 0.7,
        "line-width": 2,
      },
      filter: ["==", "$type", "Polygon"],
    });
  }

  // Render Center line
  // if (!map.getLayer("eclipse-center-line")) {
  //   map.addLayer({
  //     id: "eclipse-center-line",
  //     type: "line",
  //     source: "eclipse-path-geojson",
  //     layout: {
  //       "line-join": "round",
  //       "line-cap": "round",
  //     },
  //     paint: {
  //       "line-color": "#444",
  //       "line-width": 2,
  //       // Line width interpolation based on zoom level - https://github.com/mapbox/mapbox-gl-js/issues/5861#issuecomment-352033339
  //       // "line-width": [
  //       //   "interpolate",
  //       //   ["exponential", 2],
  //       //   ["zoom"],
  //       //   10,
  //       //   ["*", 200, ["^", 2, -6]],
  //       //   24,
  //       //   ["*", 200, ["^", 2, 8]],
  //       // ],
  //     },
  //     filter: ["==", "$type", "LineString"],
  //   });
  // }
}

export default function EclipseMap({ pathData }: { pathData: any }) {
  // TODO: Be more specific about the path data format
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (mapContainer.current) {
      map.current = mapInit(mapContainer.current, () => setMapReady(true));
    }
  });

  useEffect(() => {
    // When the path data prop updates, pass the data to the Map instance.
    if (mapReady) {
      mapUpdateEclipsePath(map.current as Map, pathData);
    }
  }, [pathData, mapReady]);

  useEffect(() => {
    const points = pathData?.features?.[0].geometry.coordinates;

    if (points) {
      const center = points[Math.floor(points.length / 2)];

      map.current?.flyTo({ center, zoom: DEFAULT_ZOOM, duration: TRANSITION_DURATION_CHANGE_ECLIPSE });

      // TODO: Option for future - zoom to bounds of eclipse path
      // map.fitBounds([<southwest_longlat>], [<northeast_longlat]);
    }
  }, [pathData]);

  return <div ref={mapContainer} className={styles["eclipse-map-container"]} />;
}
