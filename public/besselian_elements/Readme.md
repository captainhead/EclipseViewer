Bessellian elements are described here: https://eclipse.gsfc.nasa.gov/SEcat5/beselm.html

Excerpt from the above article:

"
To define the Besselian elements of an eclipse, a plane is passed through the center of Earth which is fixed perpendicular to axis of the lunar shadow. This is called the fundamental plane and on it is constructed an X-Y rectangular coordinate system with its origin at the geocenter. The axes of this system are oriented with north in the positive Y direction and east in the positive X direction. The Z axis is perpendicular to the fundamental plane and parallel to the shadow axis. The X-Y coordinates of the shadow axis can now be expressed in units of the equatorial radius of Earth. The radii of the penumbral and umbral shadows on the fundamental plane are also tabulated as L1 and L2, respectively. The direction of the shadow axis on the celestial sphere is defined by its declination 'd' and ephemeris hour angle 'm'. Finally, the angles which the penumbral and umbral shadow cones make with the shadow axis are expressed as f1 and f2, respectively. These eight parameters, often tabulated at hourly intervals serve as the only input needed to characterize an eclipse. The details of actual eclipse calculations can be found in the references listed below. 
"

A table of Besselian elements contains polynomial coefficient for the following values:
- x,y - The coordinates where the shadow axis intersects the fundamental plane (units of Earth radius)
- l1,l2 - Radii of the penumbral and umbral shadow on the fundamental plane
- d,mu - Direction of shadow axis on the celestial sphere, declination and ephemeris hour angle
- f1,f2 - Angle of penumbral and umbral shadow cone relative to shadow axis.

Also included are:
- t0 - the time in "Terrestrial Time" at peak eclipse
- tRange - Range of values of t that produce valid/accurate eclipse conditions
- deltaT - The variance of in time between terrestrial time and universal time due to the inconsistent rotation of the Earth

File format of the included Besselian elements json files:

```js
{
  x: [-0.318157, 0.5117105, 0.0000326, -0.0000085],
  y: [0.219747, 0.2709586, -0.0000594, -0.0000047],
  d: [7.5862, 0.014844, -0.000002],
  l1: [0.535813, 0.0000618, -0.0000128],
  l2: [-0.010274, 0.0000615, -0.0000127],
  mu: [89.59122, 15.004084],

  tanF1: 0.0046683,
  tanF2: 0.004645,

  t0: 18,
  tRange: [15.00, 21.00],

  deltaT: 70.6,
}
```