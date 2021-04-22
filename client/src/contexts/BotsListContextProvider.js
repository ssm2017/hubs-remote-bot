import React from 'react';
import botsListContext from './botsListContext';
import BotDataService from "../services/BotService";

const BotsListContextProvider = (props) => {
  const [botsList, setBotsList] = React.useState([]);

  const setBotsListValue = () => {
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
        setBotsList: setBotsListValue
      }}>
      {props.children}
    </botsListContext.Provider>
  );
}
export default BotsListContextProvider;