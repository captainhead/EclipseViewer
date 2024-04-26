// Convert a terrestrial time (in hours) derived from Besselian elements to UTC time in seconds.
// deltaT is the difference between Terrestrial time and Universal time.
const toUniversalTime = (t: number, deltaT: number) => t * 60 * 60 - deltaT;

export { toUniversalTime };
