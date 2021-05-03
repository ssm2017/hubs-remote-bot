import React from "react";
const botsListContext = React.createContext({
  botsList: [],
  setBotsList: () => {},
});

export default botsListContext;
