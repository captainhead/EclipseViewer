// @ts-ignore no-unused-vars React
import React, { useRef, useEffect, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
// import useFetch from "react-fetch-hook";
import axios from "axios";

import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./EclipseMap.module.css";

import parseEclipseTable from "./map/parseEclipseTable";

async function fetchEclipse(url: string) {
  const res = await axios.get(url);
  const table = res.data;
  const result = parseEclipseTable(table);
  return result;
}

function mapInit(container: HTMLElement, onLoad) {
  mapboxgl.accessToken =
    "pk.eyJ1Ijoia2l0bGl0dGxlIiwiYSI6ImNpdDI3b3NpYjBzbjUydXFwMDJlMzF6Y2sifQ.Qx2RhMP8j2VfFUvOuA1I7A";

  const m: Map = new mapboxgl.Map({
    container: container,
    style: "mapbox://styles/mapbox/outdoors-v12",
    // style: "mapbox://styles/mapbox/satellite-streets-v12",
    center: [-90, 45],
    zoom: 3,
  });

  m.on("style.load", () => {
    m.setFog({}); // Set the default atmosphere style
  });

  m.on("load", onLoad);

  return m;
}

function mapUpdateEclipsePath(map: Map, eclipsePath) {
  map.addSource("eclipse-path-geojson", {
    type: "geojson",
    data: eclipsePath,
  });

  map.addLayer({
    id: "eclipse-umbra-extent",
    type: "fill",
    source: "eclipse-path-geojson",
    paint: {
      "fill-color": "#888888",
      "fill-opacity": 0.7,
    },
    filter: ["==", "$type", "Polygon"],
  });

  map.addLayer({
    id: "eclipse-center-line",
    type: "line",
    source: "eclipse-path-geojson",
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
}

export default function EclipseMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);

  const [eclipseGeoJson, setEclipseGeoJson] = useState(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (mapContainer.current) {

      // Once the map is loaded, then start setting layers.
      // TODO: This forces us to wait for the map to load before evening beginning to fetch the path table file. Should be able to prefetch the table if needed, then wait to set layers, etc.
      const onMapLoad = () => {
        fetchEclipse("/eclipse_path_tables/2024-04-08.txt").then(pathGeoJson => mapUpdateEclipsePath(map.current as Map, pathGeoJson));
      }

      map.current = mapInit(mapContainer.current, onMapLoad);
    }
  });

  // useEffect(() => {
  //   fetchEclipse("/eclipse_path_tables/2024-04-08.txt").then(setEclipseGeoJson);
  // }, []);

  // useEffect(() => {
  //   if (map.current) {
  //     mapUpdateEclipsePath(map.current, eclipseGeoJson);
  //   }
  // }, [eclipseGeoJson]);

  return <div ref={mapContainer} className={styles["eclipse-map-container"]} />;
}
