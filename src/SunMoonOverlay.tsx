import { scalePow } from "d3-scale";

import BesselFunctions from "./bessel_functions/BesselFunctions.ts";

import type LocalEclipseFeatures from "./types/LocalEclipseFeatures.ts";

type SunMoonOverlayProps = {
  localEclipseFeatures: LocalEclipseFeatures
  observerLatitude: number;
  observerLongitude: number;
};

// Rendering dimensions
const dim = {
  width: 316,
  height: 316,
  sunRadius: 64,
  moonRadius: 67.3, // TODO: It should be possible to compute the ratio of the sun/moon apparent diameter from Besselian elements.
};

// Transition between "sky" color and "darkness" color as the moon approaches totality.
const backgroundColorScale = scalePow([0.025, 0.5], ["#124", "#4AD"])
  .exponent(0.125)
  .clamp(true);

const SunMoonOverlay = ({
  localEclipseFeatures,
  observerLatitude,
  observerLongitude
}: SunMoonOverlayProps) => {
  const observerFundamentalPoint =
    localEclipseFeatures &&
    BesselFunctions.observerToFundamentalPlaneCoordinates(
      localEclipseFeatures.besselElements,
      observerLatitude,
      observerLongitude,
      0 // TODO: For increased accuracy, look up altitude at the observer position.
    );
  const delta = localEclipseFeatures && {
    x: localEclipseFeatures.besselElements.x - observerFundamentalPoint.x,
    y: localEclipseFeatures.besselElements.y - observerFundamentalPoint.y,
  };
  const deltaL =
    (delta && Math.sqrt(delta.x * delta.x + delta.y * delta.y)) || 0;
  const deltaAngle = delta && Math.atan2(-delta.y, -delta.x);
  const deltaScale =
    deltaL && localEclipseFeatures
      ? deltaL / localEclipseFeatures.besselElements.l1
      : Number.MAX_VALUE;

  return (
    <svg
      viewBox={`0 0 ${dim.width} ${dim.height}`}
      style={{
        height: "20vh",
        position: "absolute",
        // left,right, and margin auto allow centering at the top of the view.
        left: 0,
        right: 0,
        margin: "auto",
        pointerEvents: "none",
      }}
    >
      <defs>
        <radialGradient id="sun-moon-overlay-background-radial-gradient">
          <stop offset="90%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id="sun-moon-overlay-background-mask">
          <circle
            cx={dim.width / 2}
            cy={dim.height / 2}
            r={dim.width / 2}
            fill="url(#sun-moon-overlay-background-radial-gradient"
          />
        </mask>
      </defs>
      <rect
        // Sky background
        width={dim.width}
        height={dim.height}
        fill={backgroundColorScale(deltaScale)}
        mask="url(#sun-moon-overlay-background-mask)"
      />

      <circle
        // Sun
        style={{ fill: "#FD4" }}
        cx={dim.width / 2}
        cy={dim.height / 2}
        r={dim.sunRadius}
      />

      <circle
        // Moon
        cx={
          dim.width / 2 +
          Math.cos(deltaAngle) * deltaScale * (dim.sunRadius + dim.moonRadius)
        }
        cy={
          dim.height / 2 +
          Math.sin(deltaAngle) * deltaScale * (dim.sunRadius + dim.moonRadius)
        }
        r={dim.moonRadius}
        mask="url(#sun-moon-overlay-background-mask)"
      />

      <circle
        // Sun outline that overlays on top of moon
        style={{
          stroke: "#FD4",
          strokeWidth: "1px",
          strokeOpacity: 0.5,
          fill: "transparent",
        }}
        cx={dim.width / 2}
        cy={dim.height / 2}
        r={dim.sunRadius}
      />
    </svg>
  );
};

export default SunMoonOverlay;
