import React from "react";
import "./App.css";

import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline, createMuiTheme } from "@material-ui/core";

import BotsListContextProvider from "./contexts/BotsListContextProvider";
import SelectedBotContextProvider from "./contexts/SelectedBotContextProvider";
import BotsList from "./components/BotsList";

const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BotsListContextProvider>
        <SelectedBotContextProvider>
          <CssBaseline />
          <BotsList />
        </SelectedBotContextProvider>
      </BotsListContextProvider>
    </ThemeProvider>
  );
}

export default App;
