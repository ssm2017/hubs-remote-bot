import React from 'react';
import BotDataService from "../services/BotService";
import objectsListContext from './objectsListContext';
import selectedBotContext from "./selectedBotContext";

const ObjectsListContextProvider = (props) => {
  const [objectsList, setObjectsList] = React.useState([]);

  const {selectedBot, setSelectedBot} = React.useContext(selectedBotContext);

  const setObjectsListValue = () => {
    BotDataService.getObjectsList(selectedBot.uuid)
    .then((response) => {
      setObjectsList(response.data);
    })
    .catch((e) => {
      console.log("Error getting objects list", e);
    });
  }

  return (
    <objectsListContext.Provider value={{
        objectsList,
        setObjectsList: setObjectsListValue
      }}>
      {props.children}
    </objectsListContext.Provider>
  );
}
export default ObjectsListContextProvider;