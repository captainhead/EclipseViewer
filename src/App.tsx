import { useCallback, useEffect, useState } from "react";
import { Box, AppBar, Typography, Container } from "@mui/material";
import axios from "axios";

import EclipsePathSelector from "./EclipsePathSelector";
import EclipseMap from "./EclipseMap.tsx";
import AppContext from "./AppContext";

import parseEclipseTable from "./map/parseEclipseTable.ts";

import EclipseTables from "./assets/eclipse_tables.json";

async function fetchEclipsePath(url: string) {
  const res = await axios.get(url);
  const table = res.data;
  const result = parseEclipseTable(table);
  return result;
}

function App() {
  const [eclipsePaths, setEclipsePaths] = useState(EclipseTables.tables);
  const [eclipsePathCurrent, setEclipsePathCurrent] = useState(
    EclipseTables.tables[0]
  );
  const [eclipsePathGeoJson, setEclipsePathGeoJson] = useState({});

  useEffect(() => {
    fetchEclipsePath(eclipsePathCurrent.url).then(setEclipsePathGeoJson);
  }, [eclipsePathCurrent]);

  const handleOnChange = useCallback((value: string) => {
    const current = EclipseTables.tables.find((t) => t.name === value);
    if (current) {
      setEclipsePathCurrent(current);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{ eclipsePaths, eclipsePathCurrent, eclipsePathGeoJson }}
    >
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <EclipsePathSelector onChange={handleOnChange} />
        <Box sx={{ flex: 1, display: "flex" }}>
          <EclipseMap pathData={eclipsePathGeoJson}/>
        </Box>
      </Box>
    </AppContext.Provider>
  );
}

export default App;
