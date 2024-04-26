// import React, { useRef, useEffect, useState } from "react";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import mapboxgl, { LngLatBoundsLike, Map, Projection } from "mapbox-gl";

import MapboxContext from "./MapboxContext";

import "mapbox-gl/dist/mapbox-gl.css";

import styles from "./MapboxContainer.module.css";

const DEFAULT_ZOOM = 3;

// TODO: Monitor and rotate this token if it's misused.
mapboxgl.accessToken =
  "pk.eyJ1Ijoia2l0bGl0dGxlIiwiYSI6ImNpdDI3b3NpYjBzbjUydXFwMDJlMzF6Y2sifQ.Qx2RhMP8j2VfFUvOuA1I7A";

function createAndInitializeMapbox(container: HTMLDivElement) {
  return new Promise<Map>((resolve) => {
    const m: Map = new mapboxgl.Map({
      container: container,
      style: "mapbox://styles/mapbox/outdoors-v12",
      projection: "globe" as unknown as Projection, // @types/mapbox-gl incorrectly disallows strings as Projection's
      center: [-95, 40], // Initially center the view on North America.
      zoom: DEFAULT_ZOOM,
    });

    m.on("style.load", () => {
      m.setFog({}); // Use Mapbox's default style with fog and starfield effect.
    });

    m.on("load", () => {
      resolve(m);
    });
  });
}

type MapboxContainerProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clickHandler?: (event: any) => void;
  bounds?: number[][];
} & PropsWithChildren;

// Creates a div container and initializes a Mapbox-gl instance.
// The map is ready after the following asynchronous steps:
// - Render once to create the container <div>
// - Pass the container ref to the mapbox instance constructor
// - Await the initialization ('load' event) of the mapbox instance
const MapboxContainer = ({
  clickHandler,
  bounds,
  children,
}: MapboxContainerProps) => {
  //   const mapContainer = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<Map | null>(null);

  // Handler to instantiate a Mapbox instance when the container div has been created.
  const mapContainerRefHandler = useCallback(
    async (node: HTMLDivElement | null) => {
      if (node) {
        const map = await createAndInitializeMapbox(node);
        setMapInstance(map);
      }
    },
    []
  );

  // Register click event handler
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clickHandlerWrapper = (e: any) => clickHandler?.(e); // Using "any" type here because the type provided by Mapbox types is a complex intersection type that I do not want to copy here.

    mapInstance?.on("click", clickHandlerWrapper);

    return () => {
      mapInstance?.off("click", clickHandlerWrapper);
    };
  }, [mapInstance, clickHandler]);

  // Fit the view to newly updated bounds. This would typically happen when an eclipse path is first loaded.
  useEffect(() => {
    if (bounds) {
      mapInstance?.fitBounds(bounds as LngLatBoundsLike, { padding: 8 }); // Using "as LngLatBoundsLike" here because the Mapbox Types do not accept "number[][]" as an array of "LngLatLike".
    }
  }, [mapInstance, bounds]);

  return (
    <div ref={mapContainerRefHandler} className={styles["mapbox-container"]}>
      {mapInstance && (
        <MapboxContext.Provider value={mapInstance}>
          {children}
        </MapboxContext.Provider>
      )}
    </div>
  );
};

export default MapboxContainer;
