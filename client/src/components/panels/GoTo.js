import React from "react";
import BotDataService from "../../services/BotService";
import SystemMessage from "../utils/SystemMessage";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";

const GoTo = (props) => {
  const initialPositionState = {
    position: {
      x: null,
      y: null,
      z: null,
    },
  };
  const [currentPosition, setCurrentPosition] = React.useState(initialPositionState);

  const handlePositionChange = (event) => {
    const { name, value } = event.target;
    setCurrentPosition((currentPosition) => ({
      ...currentPosition,
      position: {
        ...currentPosition.position,
        [name]: value,
      },
    }));
  };

  // system message
  const initialSystemMessage = {
    message: null,
    status: 0,
  };
  const [currentSystemMessage, setCurrentSystemMessage] = React.useState(initialSystemMessage);

  const goTo = () => {
    var data = {
      x: currentPosition.position.x,
      y: currentPosition.position.y,
      z: currentPosition.position.z,
    };
    BotDataService.goTo(props.bot.uuid, data)
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
          value={currentPosition.position.x || ""}
          onChange={handlePositionChange}
          name="x"
        />
        <InputLabel htmlFor="position_y">Position Y</InputLabel>
        <TextField
          type="number"
          className="form-control"
          id="position_y"
          required
          value={currentPosition.position.y || ""}
          onChange={handlePositionChange}
          name="y"
        />
        <InputLabel htmlFor="position_z">Position Z</InputLabel>
        <TextField
          type="text"
          className="form-control"
          id="position_z"
          required
          value={currentPosition.position.z || ""}
          onChange={handlePositionChange}
          name="z"
        />
      </CardContent>
      <CardActions>
        <Button color="primary" variant="contained" onClick={goTo}>
          Go To
        </Button>
      </CardActions>
    </Card>
  );
};

export default GoTo;
