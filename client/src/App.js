import React from "react";
import "./App.css";

import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline, createMuiTheme } from "@material-ui/core";

import BotsListContextProvider from "./contexts/BotsListContextProvider";
import SelectedBotContextProvider from "./contexts/SelectedBotContextProvider";
import BotsList from "./components/BotsList";
import ConfigContextProvider from "./contexts/ConfigContextProvider";

const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

function App() {
  return (
    <ConfigContextProvider>
      <ThemeProvider theme={theme}>
        <BotsListContextProvider>
          <SelectedBotContextProvider>
            <CssBaseline />
            <BotsList />
          </SelectedBotContextProvider>
        </BotsListContextProvider>
      </ThemeProvider>
    </ConfigContextProvider>
  );
}

export default App;
