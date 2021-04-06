import React from "react";
import { Switch, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AddBot from "./components/AddBot";
import Bot from "./components/Bot";
import BotsList from "./components/BotsList";

function App() {
  return (
    <div>
      <div className="container mt-3">
        <Switch>
          <Route exact path={["/", "/bots"]} component={BotsList} />
          <Route exact path="/add" component={AddBot} />
          <Route path="/bots/:uuid" component={Bot} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
