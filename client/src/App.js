import React from "react";
import { Switch, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AddBot from "./components/AddBot";
import Bot from "./components/Bot";
import BotsList from "./components/BotsList";

function App() {
  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <a href="/bots" className="navbar-brand">
          bezKoder
        </a>
        <div className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link to={"/bots"} className="nav-link">
              Bots
            </Link>
          </li>
          <li className="nav-item">
            <Link to={"/add"} className="nav-link">
              Add
            </Link>
          </li>
        </div>
      </nav>

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
