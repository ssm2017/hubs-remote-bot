import React, { useEffect, useState } from "react";
import BotDataService from "../../services/BotService";
import selectedBotContext from "../../contexts/selectedBotContext";
import objectsListContext from "../../contexts/objectsListContext";
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
  FormControl,
  InputLabel,
  NativeSelect,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    "& > *": {
      margin: theme.spacing(1),
      // width: '25ch',
    },
  },
  tab: {
    minWidth: "auto",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

// source : https://gist.github.com/jpillora/7885636
const isValidUrl = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;

// main
const SpawnObjects = () => {
  const classes = useStyles();

  // system messages
  const initialSystemMessage = {
    message: null,
    status: 0,
  };
  const [currentSystemMessage, setCurrentSystemMessage] = React.useState(initialSystemMessage);

  const { selectedBot, setSelectedBot } = React.useContext(selectedBotContext);

  const { objectsList, setObjectsList } = React.useContext(objectsListContext);

  const [botIsSpawning, setBotIsSpawning] = React.useState(false);

  // tabs
  const [selectedTab, setSelectedTab] = React.useState(0);
  const handleSelectTab = (value) => {
    setSelectedTab(value);
  };

  // init values
  const initialObjectToSpawn = {
    url: "https://uploads-prod.reticulum.io/files/031dca7b-2bcb-45b6-b2df-2371e71aecb1.glb",
    position: {
      x: Math.random() * 3 - 1.5,
      y: Math.random() * 2 + 1,
      z: Math.random() * 4 - 2,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
    scale: {
      x: 1,
      y: 1,
      z: 1,
    },
    pinned: true,
    dynamic: false,
    projection: "",
    interval: 0,
  };
  const [objectToSpawn, setObjectToSpawn] = React.useState(initialObjectToSpawn);

  const [showProjection, setShowProjection] = React.useState(false);

  // input name error
  const [urlError, setUrlError] = React.useState(false);
  const [urlErrorMessage, setUrlErrorMessage] = React.useState("");

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
      if (type === "checkbox") {
        value = event.target.checked;
      }
      if (name === "url") {
        setShowProjection(false);
        setUrlError(false);
        setUrlErrorMessage("");
        if (!isValidUrl.test(value)) {
          setUrlError(true);
          setUrlErrorMessage("Wrong url");
        }
        if (value.match(/.(jpg|jpeg|png|gif)$/i)) {
          if (!urlError) {
            setShowProjection(true);
          }
        }
      }
      setObjectToSpawn({ ...objectToSpawn, [name]: value });
    }
  };

  const randomizePosition = () => {
    setObjectToSpawn((objectToSpawn) => ({
      ...objectToSpawn,
      position: {
        x: Math.random() * 3 - 1.5,
        y: Math.random() * 2 + 1,
        z: Math.random() * 4 - 2,
      },
    }));
  };

  // handle multiple spawn
  const [multipleSpawn, setMultipleSpawn] = useState(false);
  const handleMultipleSpawn = (event) => {
    setMultipleSpawn(event.target.checked);
  };
  useEffect(() => {
    setCurrentSystemMessage(initialSystemMessage);
    setMultipleSpawn(false);
    getInterval();
  }, []);

  useEffect(() => {
    getInterval();
  }, [selectedBot]);

  const getInterval = () => {
    BotDataService.getSpawnInterval(selectedBot.uuid)
      .then((response) => {
        console.log("Get interval", response.data);
        if (response.data > 0) {
          setMultipleSpawn(true);
          setObjectToSpawn({ ...objectToSpawn, interval: response.data });
        } else {
          setMultipleSpawn(false);
          setObjectToSpawn({ ...objectToSpawn, interval: 0 });
        }
      })
      .catch((e) => {
        console.log("error getting interval", e.response);
      });
  };

  const stopLoop = () => {
    BotDataService.deleteSpawnInterval(selectedBot.uuid)
      .then((response) => {
        console.log("Loop stopped");
        setMultipleSpawn(false);
        setObjectToSpawn({ ...objectToSpawn, interval: 0 });
        setObjectsList();
      })
      .catch((e) => {
        console.log("error stopping loop", e.response);
      });
  };

  // action
  const spawnObjects = () => {
    console.log("spawn!!!", objectToSpawn);
    BotDataService.spawnObjects(selectedBot.uuid, objectToSpawn)
      .then((response) => {
        console.log("Spawned");
        setObjectsList();
        getInterval();
      })
      .catch((e) => {
        console.log("error spawning", e.response);
        setCurrentSystemMessage(e.response.data.error);
      });
  };

  const urlTemplate = (
    <div className="url">
      <TextField
        id="object_url"
        name="url"
        label="Url"
        value={objectToSpawn.url}
        onChange={handleInputChange}
        error={urlError}
        helperText={urlErrorMessage}
      />
      {showProjection && (
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel htmlFor="waypoints">Select projection</InputLabel>
          <NativeSelect
            value={objectToSpawn.projection || null}
            onChange={handleInputChange}
            inputProps={{
              name: "projection",
              id: "projection",
              type: "text",
            }}
          >
            <option key={0} aria-label="None" value=""></option>
            <option key={1} value="360-equirectangular">
              360
            </option>
          </NativeSelect>
        </FormControl>
      )}
    </div>
  );

  const coordinatesTemplate = (
    <div className="coordinates">
      <ButtonGroup variant="contained" color="primary" aria-label="outlined primary button group">
        <Button
          name="position"
          onClick={() => {
            handleSelectTab(0);
          }}
        >
          Position
        </Button>
        <Button
          name="rotation"
          onClick={() => {
            handleSelectTab(1);
          }}
        >
          Rotation
        </Button>
        <Button
          name="scale"
          onClick={() => {
            handleSelectTab(2);
          }}
        >
          Scale
        </Button>
      </ButtonGroup>
      {selectedTab === 0 && (
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
            <Button color="primary" variant="contained" onClick={randomizePosition}>
              Randomize
            </Button>
          </fieldset>
        </Box>
      )}
      {selectedTab === 1 && (
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
      )}
      {selectedTab === 2 && (
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
      )}
    </div>
  );

  const optionsTemplate = (
    <div className="options">
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
    </div>
  );

  const loopTemplate = (
    <div className="loop">
      <fieldset>
        <legend>Loop</legend>
        <TextField
          type="number"
          id="interval"
          name="interval"
          label="Interval"
          InputProps={{ inputProps: { min: 999 } }}
          value={objectToSpawn.interval}
          onChange={handleInputChange}
        />
        <ButtonGroup variant="contained" color="primary" aria-label="outlined primary button group">
          {multipleSpawn && (
            <Button name="position" color="secondary" onClick={stopLoop}>
              Stop loop
            </Button>
          )}
          <Button
            name="position"
            onClick={() => {
              setObjectToSpawn({ ...objectToSpawn, interval: 2000 });
            }}
          >
            2s
          </Button>
          <Button
            name="rotation"
            onClick={() => {
              setObjectToSpawn({ ...objectToSpawn, interval: 5000 });
            }}
          >
            5s
          </Button>
          <Button
            name="scale"
            onClick={() => {
              setObjectToSpawn({ ...objectToSpawn, interval: 10000 });
            }}
          >
            10s
          </Button>
        </ButtonGroup>
      </fieldset>
    </div>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
          Spawn objects
        </Typography>
        {currentSystemMessage.message && (
          <SystemMessage level={currentSystemMessage.status} message={currentSystemMessage.message} />
        )}
        {!multipleSpawn && (
          <form className={classes.root} noValidate autoComplete="off">
            {urlTemplate}
            {coordinatesTemplate}
            {optionsTemplate}
            {loopTemplate}
          </form>
        )}
      </CardContent>
      <CardActions>
        {multipleSpawn ? (
          <Button name="position" variant="contained" color="secondary" onClick={stopLoop}>
            Stop loop
          </Button>
        ) : (
          <Button onClick={spawnObjects} color="primary" variant="contained" type="submit">
            Spawn
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default SpawnObjects;
