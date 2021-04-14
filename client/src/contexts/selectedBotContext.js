import React from 'react';
const selectedBotContext = React.createContext({
  currentBot: [],
  setCurrentBot: () => {}
});
  
export default selectedBotContext;