import React, { useEffect, useState } from "react";
import BotDataService from "../../services/BotService";
import SystemMessage from "../utils/SystemMessage";

import {
  Box,
  TextField,
  Checkbox,
  Button,
  Card,
  CardActions,
  CardContent,
  FormControlLabel,
  Typography,
  ButtonGroup,

} from "@material-ui/core";

import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  root: {
    '& > *': {
      margin: theme.spacing(1),
      // width: '25ch',
    },
  },
  tab: {
    minWidth: "auto"
  }
}));

// main
const SpawnObjects = (props) => {
  const classes = useStyles();

  // system messages
  const initialSystemMessage = {
    message: null,
    status: 0,
  };
  const [currentSystemMessage, setCurrentSystemMessage] = React.useState(initialSystemMessage);

  // tabs
  const [selectedTab, setSelectedTab] = React.useState(0);
  const handleSelectTab = (value) => {
    setSelectedTab(value);
  };

  // init values
  const initialObjectToSpawn = {
    url: "https://uploads-prod.reticulum.io/files/031dca7b-2bcb-45b6-b2df-2371e71aecb1.glb",
    position: {
      x: (Math.random() * 3 - 1.5),
      y: (Math.random() * 2 + 1),
      z: (Math.random() * 4 - 2)
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    pinned: true,
    dynamic: false,
    projection: null,
    interval: 0,
  };
  const [objectToSpawn, setObjectToSpawn] = React.useState(initialObjectToSpawn);

  // text fields content
  const handleInputChange = (event) => {
    const name = event.target.name;
    var value = event.target.value;
    const type = event.target.type;
    // check if coordinates
    var coordinates = name.split("_");
    if (["position", "rotation", "scale"].includes(coordinates[0])) {
      setObjectToSpawn((objectToSpawn) => ({
        ...objectToSpawn,
        [coordinates[0]]: {
          ...objectToSpawn[coordinates[0]],
          [coordinates[1]]: value,
        },
      }));
    } else {
      if (type == "checkbox") {
        value = event.target.checked;
      }
      setObjectToSpawn({ ...objectToSpawn, [name]: value });
    }
  };

  const randomizePosition = () => {
    setObjectToSpawn((objectToSpawn) => ({
      ...objectToSpawn,
      position: {
        x: (Math.random() * 3 - 1.5),
      y: (Math.random() * 2 + 1),
      z: (Math.random() * 4 - 2)
      },
    }));
  }

  // handle multiple spawn
  const [multipleSpawn, setMultipleSpawn] = useState(false);
  const handleMultipleSpawn = (event) => {
    setMultipleSpawn(event.target.checked);
  }
  useEffect(() => {
    setMultipleSpawn(false);
    getInterval();
  }, [])

  const getInterval = () => {
    BotDataService.getSpawnInterval(props.bot.uuid)
    .then((response) => {
      console.log("Get interval", response.data);
      if (response.data > 0) {
        setMultipleSpawn(true);
        setObjectToSpawn({ ...objectToSpawn, interval: response.data });
      }
    })
    .catch((e) => {
      console.log("error getting interval", e.response);
    });
  }

  const stopLoop = () => {
    BotDataService.deleteSpawnInterval(props.bot.uuid)
    .then((response) => {
      console.log("Loop stopped");
      setMultipleSpawn(false);
      setObjectToSpawn({ ...objectToSpawn, interval: 0});
    })
    .catch((e) => {
      console.log("error stopping loop", e.response);
    });
  }

  // action
  const spawnObjects = () => {
    console.log("spawn!!!", objectToSpawn);
    BotDataService.spawnObjects(props.bot.uuid, objectToSpawn)
    .then((response) => {
      console.log("Spawned");
    })
    .catch((e) => {
      console.log("error spawning", e.response);
    });
  }

  const deleteObjects = () => {
    BotDataService.deleteObjects(props.bot.uuid)
    .then((response) => {
      console.log("Objects in deletion");
    })
    .catch((e) => {
      console.log("error deleting objects", e.response);
    });
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
        <form className={classes.root} noValidate autoComplete="off">
          {/* url */}
          <TextField
            id="object_url"
            name="url"
            label="Url"
            value={objectToSpawn.url}
            onChange={handleInputChange}
          />
          <ButtonGroup variant="contained" color="primary" aria-label="outlined primary button group">
            <Button name="position" onClick={() => {handleSelectTab(0)}}>Position</Button>
            <Button name="rotation" onClick={() => {handleSelectTab(1)}}>Rotation</Button>
            <Button name="scale" onClick={() => {handleSelectTab(2)}}>Scale</Button>
          </ButtonGroup>
          {selectedTab === 0 &&
          <Box>
            <fieldset>
              <legend>Position</legend>
              <TextField
                type="number"
                id="object_position_x"
                name="position_x"
                label="Position.x"
                value={objectToSpawn.position.x}
                onChange={handleInputChange}
              />
              <TextField
                type="number"
                id="object_position_y"
                name="position_y"
                label="Position.y"
                value={objectToSpawn.position.y}
                onChange={handleInputChange}
              />
              <TextField
                type="number"
                id="object_position_z"
                name="position_z"
                label="Position.z"
                value={objectToSpawn.position.z}
                onChange={handleInputChange}
              />
              <Button
                color="primary"
                variant="contained"
                onClick={randomizePosition}
              >Randomize
              </Button>
            </fieldset>
          </Box>
          }
          {selectedTab === 1 &&
          <Box>
            <fieldset>
              <legend>Rotation</legend>
              <TextField
                type="number"
                id="object_rotation_x"
                name="rotation_x"
                label="Rotation.x"
                value={objectToSpawn.rotation.x}
                onChange={handleInputChange}
              />
              <TextField
                type="number"
                id="object_rotation_y"
                name="rotation_y"
                label="Rotation.y"
                value={objectToSpawn.rotation.y}
                onChange={handleInputChange}
              />
              <TextField
                type="number"
                id="object_rotation_z"
                name="rotation_z"
                label="Rotation.z"
                value={objectToSpawn.rotation.z}
                onChange={handleInputChange}
              />
            </fieldset>
          </Box>
          }
          {selectedTab === 2 &&
          <Box>
            <fieldset>
              <legend>Scale</legend>
              <TextField
                type="number"
                id="object_scale_x"
                name="scale_x"
                label="Scale.x"
                value={objectToSpawn.scale.x}
                onChange={handleInputChange}
              />
              <TextField
                type="number"
                id="object_scale_y"
                name="scale_y"
                label="Scale.y"
                value={objectToSpawn.scale.y}
                onChange={handleInputChange}
              />
              <TextField
                type="number"
                id="object_scale_z"
                name="scale_z"
                label="Scale.z"
                value={objectToSpawn.scale.z}
                onChange={handleInputChange}
              />
            </fieldset>
          </Box>
          }
          {/* pinned */}
          <FormControlLabel
            control={
              <Checkbox
                id="object_pinned"
                name="pinned"
                label="Pinned"
                checked={objectToSpawn.pinned}
                onChange={handleInputChange}
              />
            }
            label="Pinned"
          />
          {/* dynamic */}
          <FormControlLabel
            control={
              <Checkbox
                id="object_dynamic"
                name="dynamic"
                label="Dynamic"
                checked={objectToSpawn.dynamic}
                onChange={handleInputChange}
              />
            }
            label="Dynamic"
          />
          {/* interval */}
          <fieldset>
            <legend>Loop</legend>
            <TextField
              type="number"
              id="interval"
              name="interval"
              label="Interval"
              InputProps={{inputProps: {min: 999}}}
              value={objectToSpawn.interval}
              onChange={handleInputChange}
            />
            {multipleSpawn &&
              <Button
                color="primary"
                variant="contained"
                onClick={stopLoop}
              >Stop Loop
              </Button>
            }
          </fieldset>
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
        <Button
          onClick={deleteObjects}
          color="secondary"
          variant="contained"
        >
          Delete objects
        </Button>
      </CardActions>
    </Card>
  );
}

export default SpawnObjects;