// source : https://stackoverflow.com/questions/62976020/passing-react-values-from-child-to-parent
import React from "react";
export const botCreatedContext = React.createContext();

export const botCreatedContextProvider = ({children}) => {

  const onBotCreated = () => {}
  return (
    <AppContextProvider.Provider
      value={{onBotCreated}}
    >
    {children}
    </AppContextProvider.Provider>
  )
  
}