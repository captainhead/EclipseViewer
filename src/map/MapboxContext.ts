import { Map } from "mapbox-gl";
import { createContext } from "react";

// Coercing object into type Map since this context should only provide a valid, instantiated Mapbox instance.
const MapboxContext = createContext<Map>({} as Map);

export default MapboxContext;