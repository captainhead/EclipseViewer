/*

  MODULE NOT IN USE

  A previous iteration of the app would consume precomputed eclipse path tables, and render them as GeoJSON polygons.

*/


/* 
import { useContext } from "react";
import {
  Container,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import AppContext from "./AppContext";

// const ECLIPSE_SELECT_LABEL = "Choose an Eclipse"; // Just bizarre this needs to be used in both InputLabel and label= prop

export default function ({ onChange }: { onChange: (value: string) => void }) {
  const appContext = useContext(AppContext);

  if (!appContext) return null; // Handle the edge case where app context was not initialized

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center", // Align text label baseline and Select text baseline
      }}
    >
      <Typography variant="h6">Select an eclipse to view:</Typography>
      <FormControl sx={{ m: 1 }}>
        <Select
          id="eclipse-select"
          // label={ECLIPSE_SELECT_LABEL}
          // labelId="eclipse-select-label"
          value={appContext.eclipsePathCurrent.name}
          onChange={e => onChange(e.target.value)}
        >
          {appContext.eclipsePaths.map((path) => (
            <MenuItem key={path.name} value={path.name}>
              {path.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Container>
  );
}
*/