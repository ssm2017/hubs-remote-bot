import React from 'react';
import selectedBotContext from './selectedBotContext';

const SelectedBotContextProvider = (props) => {
  const [selectedBot, setSelectedBot] = React.useState({
    uuid: null,
    name: "",
    room_url: "",
  });

  const setSelectedBotValue = (value) => {
    setSelectedBot(value);
  }

  return (
    <selectedBotContext.Provider value={{
      selectedBot,
      setSelectedBot: setSelectedBotValue
      }}>
      {props.children}
    </selectedBotContext.Provider>
  );
}
export default SelectedBotContextProvider;