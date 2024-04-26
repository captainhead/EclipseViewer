import type BesselianTable from "../types/BesselianTable.ts";
import type BesselianElements from "../types/BesselianElements.ts";
import type LocalEclipseFeatures from "../types/LocalEclipseFeatures.ts";
import type GlobalEclipseFeatures from "../types/GlobalEclipseFeatures.ts";
import type ShadowOutlineCurve from "../types/ShadowOutlineCurve.ts";
import type GeographicCoordinate from "../types/GeographicCoordinate.ts";
import type FundamentalPlaneCoordinates from "../types/FundamentalPlaneCoordinates.ts";

// @ts-expect-error Importing a JS file with no type declarations.
import butil from "./util.js";
// @ts-expect-error Importing a JS file with no type declarations.
import Outline from "./outline.js";
// @ts-expect-error Importing a JS file with no type declarations.
import Path from "./path.js";

// Outline computations output the format {long: number, lat: number}, convert to [long, lat] form for use in GeoJSON.
function toLongLat(coordinates: GeographicCoordinate[]): ShadowOutlineCurve {
  return coordinates.map(({ long, lat }) => [long, lat]);
}

// Compute current circumstances of the eclipse at time t. This includes the current Besselian Elements, as well as current umbral and penumbral boundaries in geographic coordinates, suitable for use as geoJSON
function computeLocalEclipseFeatures(
  besselTable: BesselianTable,
  t: number
): LocalEclipseFeatures {
  if (t < besselTable.tRange[0] || t > besselTable.tRange[1])
    console.warn(
      "Attempting to sample Besselian elements at time outside of valid time range. Results will not be accurate."
    );

  const tDiff = t - besselTable.t0;
  const besselElements = butil.calculateBesselianElements(besselTable, tDiff);

  return {
    besselElements,
    umbraOutline: toLongLat(Outline.shadowOutlinePath(besselElements, "umbra")),
    penumbraOutline: toLongLat(
      Outline.shadowOutlinePath(besselElements, "penumbra")
    ),
  };
}

// Convert an observer's position at the given geographic latitude, longitude, and optional height (in meters) from sea level (i.e. altitude), to x,y,z position in Besselian fundamental plane coordinates.
function observerToFundamentalPlaneCoordinates(
  besselElements: BesselianElements,
  lat: number,
  long: number,
  height: number = 0
): FundamentalPlaneCoordinates {
  const lambda = -long; // Coordinate transform works in opposite direction around polar axis.

  const H = butil.toRadians(
    besselElements.mu -
      lambda -
      butil.degreesPerSecondRotation * besselElements.deltaT
  );
  const phi = butil.toRadians(lat);
  const dRad = butil.toRadians(besselElements.d);

  const u1 = Math.atan(butil.sqrtOneMinusESquared * Math.tan(phi));
  const rhoSinPhiP =
    butil.sqrtOneMinusESquared * Math.sin(u1) +
    (height / butil.EarthRadius) * Math.sin(phi);
  const rhoCosPhiP =
    Math.cos(u1) + (height / butil.EarthRadius) * Math.cos(phi);

  return {
    x: rhoCosPhiP * Math.sin(H),
    y: rhoSinPhiP * Math.cos(dRad) - rhoCosPhiP * Math.cos(H) * Math.sin(dRad),
    z: rhoSinPhiP * Math.sin(dRad) + rhoCosPhiP * Math.cos(H) * Math.cos(dRad),
  };
}

function computeGlobalEclipseFeatures(
  besselTable: BesselianTable
): GlobalEclipseFeatures {
  return Path.computeGlobalEclipseCircumstances(besselTable);
}

export default {
  computeLocalEclipseFeatures,
  computeGlobalEclipseFeatures,
  observerToFundamentalPlaneCoordinates,
};
