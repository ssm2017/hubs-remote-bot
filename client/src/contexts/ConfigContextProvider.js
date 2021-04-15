import React from 'react';
import configContext from './configContext';
import useStickyState from "../components/utils/useStickyState";

const ConfigContextProvider = (props) => {
  const [config, setConfig] = useStickyState({
    enableAutoRefresh: false,
    soloMode: false,
    panels: ["properties"]
  }, "config");

  // const [config, setConfig] = React.useState({
  //     enableAutoRefresh: false,
  //     panels: ["properties"]
  //   });
  const setConfigValue = (name, value) => {
    setConfig({...config, [name]: value});
  }

  return (
    <configContext.Provider value={{
        config,
        setConfig: setConfigValue
      }}>
      {props.children}
    </configContext.Provider>
  );
}
export default ConfigContextProvider;