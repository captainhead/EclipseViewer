import { useEffect, useState } from "react";
import { Box, Button, Link, Slider } from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayIcon from "@mui/icons-material/PlayArrow";
import axios from "axios";

import BesselianTable from "./types/BesselianTable.ts";

import MapboxContainer from "./map/MapboxContainer.tsx";
import Umbra from "./map/layers/Umbra.tsx";
import Penumbra from "./map/layers/Penumbra.tsx";
import Path from "./map/layers/Path.tsx";
import ObserverIcon from "./map/layers/ObserverIcon.tsx";

import BesselFunctions from "./bessel_functions/BesselFunctions.ts";
import { toUniversalTime } from "./bessel_functions/terrestrialTime";

import SunMoonOverlay from "./SunMoonOverlay.tsx";
import LocalEclipseFeatures from "./types/LocalEclipseFeatures.ts";
import GlobalEclipseFeatures from "./types/GlobalEclipseFeatures.ts";
import GeographicCoordinate from "./types/GeographicCoordinate.ts";

async function fetchBesselianElements(url: string) {
  const res = await axios.get(url);
  return res.data;
}

function App() {
  const [besselianTable, setBesselianTable] = useState<BesselianTable | null>(
    null
  );
  const [globalEclipseFeatures, setGlobalEclipseFeatures] =
    useState<GlobalEclipseFeatures | null>(null);
  const [localEclipseFeatures, setLocalEclipseFeatures] =
    useState<LocalEclipseFeatures | null>(null);
  const [observerPosition, setObserverPosition] =
    useState<GeographicCoordinate | null>(null);
  const [animationIsRunning, setAnimationIsRunning] = useState(true);
  const [animationTime, setAnimationTime] = useState(-1);

  useEffect(() => {
    // TODO: Allow for selecting other besselian elements tables from other total eclipses.
    fetchBesselianElements("besselian_elements/2024-04-08.json").then(
      (table) => {
        setBesselianTable(table);
      }
    );
  }, []);

  useEffect(() => {
    if (besselianTable) {
      // Reset animation to start
      setAnimationTime(besselianTable.tRange[0]);

      // Calculate static circumstances, e.g. lines representing the path of the shadow.
      const c = BesselFunctions.computeGlobalEclipseFeatures(besselianTable);
      setGlobalEclipseFeatures(c);

      // Initialize observer position to the middle of the umbral shadow's path.
      setObserverPosition({ long: c.center[0], lat: c.center[1] });
    }
  }, [besselianTable]);

  useEffect(() => {
    if (!besselianTable || animationTime < 0) return;

    // TODO: Allow control of playback speed in UI.
    const frameRate = 20; // frames per second.
    const playbackSpeed = 0.05; // hours of realtime per second of animation, e.g. 0.1 means 1/10 of an hour (i.e. 6 minutes) per second of animation time.

    const frameTime = 1 / frameRate; // seconds per frame

    const features = BesselFunctions.computeLocalEclipseFeatures(
      besselianTable,
      animationTime
    );
    setLocalEclipseFeatures(features);

    let animationTimeout: number;
    if (animationIsRunning && animationTime <= besselianTable.tRange[1]) {
      animationTimeout = setTimeout(() => {
        setAnimationTime(animationTime + frameTime * playbackSpeed);
      }, frameTime * 1000);
    } else {
      setAnimationIsRunning(false);
    }

    return () => {
      if (animationTimeout) clearTimeout(animationTimeout);
    };
  }, [besselianTable, animationIsRunning, animationTime]);

  const tCurrentHours = localEclipseFeatures
    ? localEclipseFeatures.besselElements.t0 +
      localEclipseFeatures.besselElements.t
    : undefined;

  // Format time string in user's current locale
  let timeDisplay = "";
  if (besselianTable && tCurrentHours) {
    const UTCTime = new Date(besselianTable.date);
    UTCTime.setSeconds(toUniversalTime(tCurrentHours, besselianTable.deltaT));

    timeDisplay = UTCTime.toLocaleString(
      Intl.DateTimeFormat().resolvedOptions().locale,
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      }
    );
  }

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, display: "flex" }}>
        <MapboxContainer
          clickHandler={(e) => {
            setObserverPosition({
              lat: e.lngLat.lat,
              long: e.lngLat.lng,
            });
          }}
          bounds={globalEclipseFeatures?.bounds}
        >
          {localEclipseFeatures && (
            <>
              <Penumbra
                outlineCoordinates={localEclipseFeatures.penumbraOutline}
              ></Penumbra>
              <Umbra
                outlineCoordinates={localEclipseFeatures.umbraOutline}
              ></Umbra>
            </>
          )}
          {globalEclipseFeatures && (
            <Path
              northLine={globalEclipseFeatures.umbraLimitNorth.map((p) => [
                p.lon,
                p.lat,
              ])}
              southLine={globalEclipseFeatures.umbraLimitSouth.map((p) => [
                p.lon,
                p.lat,
              ])}
            ></Path>
          )}
          {observerPosition && (
            <ObserverIcon
              position={[observerPosition.long, observerPosition.lat]}
            />
          )}
        </MapboxContainer>
        {localEclipseFeatures && observerPosition ? (
          <SunMoonOverlay
            localEclipseFeatures={localEclipseFeatures}
            observerLatitude={observerPosition.lat}
            observerLongitude={observerPosition.long}
          />
        ) : null}
      </Box>
      <div
        style={{
          padding: "8px",
          display: " flex",
          justifyContent: "center",
        }}
      >
        {timeDisplay}
      </div>
      <div
        style={{
          padding: "0 16px 16px 16px",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Button
          variant="contained"
          size="large"
          color={animationIsRunning ? "success" : undefined}
          onClick={() => {
            if (besselianTable) {
              if (animationTime >= besselianTable.tRange[1]) {
                // Reset animation to start
                setAnimationTime(besselianTable.tRange[0]);
              }
              setAnimationIsRunning(!animationIsRunning);
            }
          }}
        >
          {animationIsRunning ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <div
          style={{
            paddingLeft: "32px",
            paddingRight: "16px",
            flex: 1,
          }}
        >
          <Slider
            aria-label="Time Slider"
            value={tCurrentHours}
            valueLabelDisplay="off"
            min={besselianTable?.tRange[0]}
            max={besselianTable?.tRange[1]}
            step={0.0001}
            disabled={!localEclipseFeatures}
            onChange={(_e, value) => {
              setAnimationIsRunning(false);
              setAnimationTime(value as number); // value can be number or number[]. The slider is only used with a single number value.
            }}
          />
        </div>
      </div>
      <FlatIconAttribution />
    </Box>
  );
}

function FlatIconAttribution() {
  return (
    <div
      style={{
        visibility: "hidden", // TODO: Create a slideout/credits section for any further attributions.
        position: "absolute",
        top: 0,
        opacity: 0.3,
        width: "35vw",
      }}
    >
      <Link
        href="https://www.flaticon.com/free-icons/map-marker"
        variant="caption"
      >
        Map marker icon created by gungyoga04 - Flaticon
      </Link>
    </div>
  );
}

export default App;
