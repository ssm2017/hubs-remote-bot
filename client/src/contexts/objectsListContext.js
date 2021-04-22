import React from 'react';
const objectsListContext = React.createContext({
  objectsList: [],
  setObjetcsList: () => {}
});
  
export default objectsListContext;