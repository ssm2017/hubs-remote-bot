import React from "react";
import Alert from "@material-ui/lab/Alert";

const SystemMessage = (props) => {
  const [levelState, setLevelState] = React.useState("info");

  React.useEffect(() => {
    switch (props.level) {
      case 100:
        setLevelState("info");
        break;
      case 200:
        setLevelState("success");
        break;
      case 304:
        setLevelState("warning");
        break;
      case 400:
      case 404:
      case 500:
        setLevelState("error");
        break;
      default:
        setLevelState(props.level);
    }
  }, [props]);
  return (
    <Alert elevation={6} variant="filled" severity={levelState}>
      {props.message}
    </Alert>
  );
};
export default SystemMessage;
