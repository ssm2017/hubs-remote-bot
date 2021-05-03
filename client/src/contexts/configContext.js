import React from "react";
const configContext = React.createContext({
  config: null,
  setConfig: () => {},
});

export default configContext;
