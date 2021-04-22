import React from "react";
import BotDataService from "../../services/BotService";
import SystemMessage from "../utils/SystemMessage";
import selectedBotContext from "../../contexts/selectedBotContext";

import {
  TextField,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
  InputLabel
} from "@material-ui/core";

const GoTo = () => {
  // system message
  const initialSystemMessage = {
    message: null,
    status: 0,
  };
  const [currentSystemMessage, setCurrentSystemMessage] = React.useState(initialSystemMessage);

  const {selectedBot, setSelectedBot} = React.useContext(selectedBotContext);

  // init position
  const initialPositionState = {
    x: null,
    y: null,
    z: null
  };
  const [actualPosition, setActualPosition] = React.useState(initialPositionState);
  const [newPosition, setNewPosition] = React.useState(initialPositionState);

  // get position
  const getPosition = () => {
    BotDataService.getPosition(selectedBot.uuid)
    .then((response) => {
      setActualPosition(response.data);
    })
    .catch((e) => {
      setCurrentSystemMessage(e.response.data.error);
      console.log("error response from get position", e.response);
    });
  }

  React.useEffect(() => {
    getPosition();
  }, [])

  React.useEffect(() => {
    setNewPosition(actualPosition);
  }, [actualPosition]);
  

  const handlePositionChange = (event) => {
    const { name, value } = event.target;
    setNewPosition({...newPosition, [name]: value});
  };

  const goTo = () => {
    var data = {
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
    };
    BotDataService.setPosition(selectedBot.uuid, data)
    .then((response) => {
      setCurrentSystemMessage(response.data);
      console.log("response from go to", response.data);
    })
    .catch((e) => {
      setCurrentSystemMessage(e.response.data.error);
      console.log("error response from go to", e.response);
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
          Go to
        </Typography>
        {currentSystemMessage.message && (
          <SystemMessage level={currentSystemMessage.status} message={currentSystemMessage.message} />
        )}
        <InputLabel htmlFor="position_x">Position X</InputLabel>
        <TextField
          type="number"
          className="form-control"
          id="position_x"
          required
          value={newPosition.x || ""}
          onChange={handlePositionChange}
          name="x"
        />
        <InputLabel htmlFor="position_y">Position Y</InputLabel>
        <TextField
          type="number"
          className="form-control"
          id="position_y"
          required
          value={newPosition.y || ""}
          onChange={handlePositionChange}
          name="y"
        />
        <InputLabel htmlFor="position_z">Position Z</InputLabel>
        <TextField
          type="text"
          className="form-control"
          id="position_z"
          required
          value={newPosition.z || ""}
          onChange={handlePositionChange}
          name="z"
        />
      </CardContent>
      <CardActions>
        <Button color="primary" variant="contained" onClick={goTo}>
          Go To
        </Button>
        <Button color="primary" variant="contained" onClick={getPosition}>
          Get position
        </Button>
      </CardActions>
    </Card>
  );
};

export default GoTo;
