import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import App from "./App.tsx";

import "./index.css";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";


const DEFAULT_THEME = createTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={DEFAULT_THEME}>
      <CssBaseline />
      <App />
      {/* <EclipseMap /> */}
    </ThemeProvider>
  </React.StrictMode>
);
