import React from "react";
import BotDataService from "../../services/BotService";
import SystemMessage from "../utils/SystemMessage";

import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import NativeSelect from "@material-ui/core/NativeSelect";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const JumpTo = (props) => {
  const classes = useStyles();

  // system messages
  const initialSystemMessage = {
    message: null,
    status: 0,
  };
  const [currentSystemMessage, setCurrentSystemMessage] = React.useState(initialSystemMessage);

  const [waypointsList, setWaypointsList] = React.useState([]);
  const [currentWaypoint, setCurrentWaypoint] = React.useState(null);

  const getWaypoints = () => {
    BotDataService.getWaypointsList(props.bot.uuid)
    .then((response) => {
      setWaypointsList(response.data);
      console.log(response.data);
    })
    .catch((e) => {
      console.log(e.response);
      setCurrentSystemMessage(e.response.data.error);
    });
  };
  React.useEffect(() => {
    getWaypoints();
  }, [props]);

  const handleWaypointChange = (event) => {
    setCurrentWaypoint(event.target.value);
  };

  const jumpTo = () => {
    var data = {
      waypoint: currentWaypoint,
    };
    BotDataService.jumpTo(props.bot.uuid, data)
      .then((response) => {
        console.log("jump to server response", response.data);
        setCurrentWaypoint(null);
      })
      .catch((e) => {
        console.log("error", e.response.data);
        setCurrentWaypoint(null);
        setCurrentSystemMessage(e.response.data.error);
      });
  };

  const waypointsAvailable = (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel htmlFor="waypoints">Select a waypoint</InputLabel>
      <NativeSelect
        value={currentWaypoint || ""}
        onChange={handleWaypointChange}
        inputProps={{
          name: "waypoint",
          id: "waypoints",
          type: "text",
        }}
      >
        <option key={0} aria-label="None" value=""></option>
        {waypointsList &&
          waypointsList.map((waypoint, index) => (
            <option key={index + 1} value={waypoint.name}>
              {waypoint.name}
            </option>
          ))}
      </NativeSelect>
      {currentWaypoint && (
        <Button onClick={jumpTo} variant="contained">
          Jump To
        </Button>
      )}
    </FormControl>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
          Jump to
        </Typography>
        {currentSystemMessage.message && (
          <SystemMessage level={currentSystemMessage.status} message={currentSystemMessage.message} />
        )}
        {/* {waypointsList.length ? waypointsAvailable : setCurrentSystemMessage({message:"No waypoint found", status: "warning"})} */}
        {waypointsList.length ? waypointsAvailable : "No waypoint found."}
      </CardContent>
    </Card>
  );
};

export default JumpTo;
