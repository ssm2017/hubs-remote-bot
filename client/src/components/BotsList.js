import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BotDataService from "../services/BotService";
import BotPanel from "./BotPanel";

const BotsList = () => {
  const [bots, setBots] = useState([]);
  const [currentBot, setCurrentBot] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    retrieveBots();
  }, []);

  const retrieveBots = () => {
    BotDataService.getAll()
      .then(response => {
        setBots(response.data);
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const refreshList = () => {
    retrieveBots();
    setCurrentBot(null);
    setCurrentIndex(-1);
  };

  const setActiveBot = (bot, index) => {
    setCurrentBot(bot);
    setCurrentIndex(index);
  };

  const removeAllBots = () => {
    BotDataService.removeAll()
      .then(response => {
        console.log(response.data);
        refreshList();
      })
      .catch(e => {
        console.log(e);
      });
  };

  const noBotTemplate = (
    <div className="alert alert-info" role="alert">No bot.</div>
  );
  const botsListTemplate = (
    <div>
    <div className="list row">
      <div className="col-md-6">
        <h4>Bots List {bots.length}</h4>

        <ul className="list-group">
          {bots &&
            bots.map((bot, index) => (
              <li
                className={
                  "list-group-item " + (index === currentIndex ? "active" : "")
                }
                onClick={() => setActiveBot(bot, index)}
                key={index}
              >
                {bot.name}
              </li>
            ))}
        </ul>

        <button
          className="m-3 btn btn-sm btn-danger"
          onClick={removeAllBots}
        >
          Remove All
        </button>
        <Link to="/add" className="m-3 btn btn-sm btn-success">New bot</Link>
      </div>
      <div className="col-md-6">
        {currentBot ? (
          <div>
            <BotPanel bot={currentBot}/>
          </div>
        ) : (
          <div>
            <br />
            <p>Please click on a Bot...</p>
          </div>
        )}
      </div>
      
    </div>
  </div>
  );
  const botsQty = bots.length;
  return <div>{botsQty ? botsListTemplate : noBotTemplate}</div>;
};

export default BotsList;
