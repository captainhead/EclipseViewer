/*

  MODULE NOT IN USE

  A test of the Astronomy Engine library. This computes the angle between the sun and moon at a given time.

*/

/* 
import { Equator, Observer, Body, AngleBetween } from "astronomy-engine";

const UTCTime = new Date(Date.UTC(2024, 3, 8)); // Note 3 is the 0-based index for month, i.e. April.
eclipseFeatures &&
  UTCTime.setSeconds(
    toUniversalTime(
      eclipseFeatures.besselElements.tRange[0] +
        eclipseFeatures.besselElements.t,
      eclipseFeatures.besselElements.deltaT
    )
  );

const eqSun = Equator(
  Body.Sun,
  UTCTime,
  new Observer(observerPosition.lat, observerPosition.long, 0),
  // The following two params will correct for procession, nutation, aberration, if set to true.
  false,
  false
);
const eqMoon = Equator(
  Body.Moon,
  UTCTime,
  new Observer(observerPosition.lat, observerPosition.long, 0),
  // The following two params will correct for procession, nutation, aberration, if set to true.
  false,
  false
);
const sunMoonAngle = AngleBetween(eqSun.vec, eqMoon.vec);
 */