import React from "react";
import "./App.css";

import { ThemeProvider } from "@material-ui/styles";
import {
  CssBaseline,
  createMuiTheme
} from "@material-ui/core";

import BotsList from "./components/BotsList";

const theme = createMuiTheme({
  palette: {
    type: "dark"
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BotsList />
    </ThemeProvider>
  );
}

export default App;
