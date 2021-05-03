import React from "react";
import Properties from "./panels/Properties";
import PlayFile from "./panels/PlayFile";
import JumpTo from "./panels/JumpTo";
import GoTo from "./panels/GoTo";
import SayInChat from "./panels/SayInChat";
import SpawnObjects from "./panels/SpawnObjects";
import ObjectsList from "./panels/ObjectsList";

import Grid from "@material-ui/core/Grid";

import configContext from "../contexts/configContext";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  item: {
    flexGrow: 1,
  },
}));

const BotPanel = (props) => {
  const classes = useStyles();

  // // manage config
  const { config, setConfig } = React.useContext(configContext);

  return (
    <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={2}>
      {config.panels.includes("properties") && (
        <Grid item className={classes.item}>
          <Properties />
        </Grid>
      )}

      {config.panels.includes("play_file") && (
        <Grid item className={classes.item}>
          <PlayFile />
        </Grid>
      )}

      {config.panels.includes("jump_to") && (
        <Grid item className={classes.item}>
          <JumpTo />
        </Grid>
      )}

      {config.panels.includes("go_to") && (
        <Grid item className={classes.item}>
          <GoTo />
        </Grid>
      )}

      {config.panels.includes("say") && (
        <Grid item className={classes.item}>
          <SayInChat />
        </Grid>
      )}

      {config.panels.includes("spawn") && (
        <Grid item className={classes.item}>
          <SpawnObjects />
        </Grid>
      )}

      {config.panels.includes("objects") && (
        <Grid item className={classes.item}>
          <ObjectsList />
        </Grid>
      )}
    </Grid>
  );
};

export default BotPanel;
