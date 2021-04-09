import React from "react";
import { Switch, Route } from "react-router-dom";
import "./App.css";

import { ThemeProvider } from "@material-ui/styles";
import {
  CssBaseline,
  createMuiTheme
} from "@material-ui/core";

import AddBot from "./components/panels/AddBot";
import Bot from "./components/Bot";
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
      <Switch>
        <Route exact path={["/", "/bots"]} component={BotsList} />
        <Route exact path="/add" component={AddBot} />
        <Route path="/bots/:uuid" component={Bot} />
      </Switch>
    </ThemeProvider>
  );
}

export default App;
