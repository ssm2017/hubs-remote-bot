import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BotDataService from "../services/BotService";
import { slide as Menu } from 'react-burger-menu';
import "./utils/react-burger-menu.css";
import BotPanel from "./BotPanel";

const BotsList = () => {
  const [bots, setBots] = useState([]);
  const [currentBot, setCurrentBot] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [showMenu, setShowMenu] = useState(false);

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
    console.log('avant', showMenu);
    setShowMenu(false);
    console.log('apres', showMenu);
    setCurrentBot(bot);
    setCurrentIndex(index);
  };

  const noBotTemplate = (
    <div className="alert alert-info" role="alert">No bot.</div>
  );

  const botsListTemplate = (
    <div className="bots-list">
      <Menu isOpen={showMenu} onStateChange={(state) => setShowMenu(state.isOpen)}>
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
      </Menu>
    <div className="list row">
      <div className="col-md-6">
        {currentBot ? (
          <div>
            <BotPanel bot={currentBot}/>
          </div>
        ) : (
          <div>
            <br />
            <p>Please select a Bot...</p>
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
