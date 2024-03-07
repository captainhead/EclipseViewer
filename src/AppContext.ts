import { createContext } from "react";

// import EclipseTables from "../public/eclipse_path_tables/eclipse_tables.json";

// const defaultState = {
//     eclipsePaths: EclipseTables.tables,
//     eclipsePathSource: EclipseTables.tables[0],
//     eclipsePathGeoJson: null
// }

type EclipseTable = {
    name: string,
    url: string
}

type AppContext = {
    eclipsePaths: EclipseTable[]
    eclipsePathCurrent: EclipseTable
    eclipsePathGeoJson: {}
}

// export default createContext(defaultState);
export default createContext<AppContext|null>(null);