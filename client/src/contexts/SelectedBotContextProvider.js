import React from 'react';
import selectedBotContext from './selectedBotContext';

const defaultSelectedBot = {
  uuid: null,
  name: "",
  room_url: "",
};

const SelectedBotContextProvider = (props) => {
  const [selectedBot, setSelectedBot] = React.useState(defaultSelectedBot);

  const setSelectedBotValue = (value) => {
    if (value) {
      setSelectedBot(value);
    } else {
      setSelectedBot(defaultSelectedBot);
    }
    
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