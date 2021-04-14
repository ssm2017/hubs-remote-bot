import React from 'react';
import botsListContext from './botsListContext';
import BotDataService from "../services/BotService";

const BotsListContextProvider = (props) => {
  const [botsList, setBotsList] = React.useState([]);

  const setBotsListdValue = () => {
    console.log("called", botsList);
    BotDataService.getAll()
    .then((response) => {
      setBotsList(response.data);
    })
    .catch((e) => {
      console.log(e);
    });
  }

  return (
    <botsListContext.Provider value={{
        botsList,
        setBotsList: setBotsListdValue
      }}>
      {props.children}
    </botsListContext.Provider>
  );
}
export default BotsListContextProvider;