import React from "react";
import BotDataService from "../../services/BotService";
import SystemMessage from "../utils/SystemMessage";

import {
  TextField,
  Checkbox,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography

} from "@material-ui/core";

const SpawnObjects = () => {
  // system messages
  const initialSystemMessage = {
    message: null,
    status: 0,
  };
  const [currentSystemMessage, setCurrentSystemMessage] = React.useState(initialSystemMessage);

  // init values
  const initialObjectToSpawn = {
    url: "https://uploads-prod.reticulum.io/files/031dca7b-2bcb-45b6-b2df-2371e71aecb1.glb",
    position: `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`,
    rotation: "0 0 0",
    scale: "1 1 1",
    pinned: true,
    dynamic: false,
    projection: null,
    interval: null,
  };
  const [objectToSpawn, setObjectToSpawn] = React.useState(initialObjectToSpawn);

  // text fields content
  const handleInputChange = (event) => {
    const name = event.target.name;
    var value = event.target.value;
    const type = event.target.type;
    if (type == "checkbox") {
      value = event.target.checked;
    }
    console.log(event.target);
    setObjectToSpawn({ ...objectToSpawn, [name]: value });
  };

  const spawnObjects = () => {
    console.log("spawn!!!", objectToSpawn);
  }

  return (
    <Card>
      <CardContent>
      <Typography variant="h5" component="h2">
        Spawn objects
      </Typography>
        {currentSystemMessage.message && (
          <SystemMessage level={currentSystemMessage.status} message={currentSystemMessage.message} />
        )}
        <form noValidate autoComplete="off">
          <TextField
            id="object_url"
            name="url"
            label="Url"
            value={objectToSpawn.url}
            onChange={handleInputChange}
          />
          <TextField
            id="object_position"
            name="position"
            label="Position"
            value={objectToSpawn.position}
            onChange={handleInputChange}
          />
          <TextField
            id="object_rotation"
            name="rotation"
            label="Rotation"
            value={objectToSpawn.rotation}
            onChange={handleInputChange}
          />
          <TextField
            id="object_scale"
            name="scale"
            label="Scale"
            value={objectToSpawn.scale}
            onChange={handleInputChange}
          />
          <Checkbox
            id="object_pinned"
            name="pinned"
            label="Pinned"
            checked={objectToSpawn.pinned}
            onChange={handleInputChange}
          />
          <Checkbox
            id="object_dynamic"
            name="dynamic"
            label="Dynamic"
            checked={objectToSpawn.dynamic}
            onChange={handleInputChange}
          />
        </form>
      </CardContent>
      <CardActions>
        <Button
          onClick={spawnObjects}
          color="primary"
          variant="contained"
          type="submit"
        >
          Spawn
        </Button>
      </CardActions>
    </Card>
  );
}

export default SpawnObjects;