import React from "react";
import Properties from "./panels/Properties";
import PlayFile from "./panels/PlayFile";
import JumpTo from "./panels/JumpTo";
import GoTo from "./panels/GoTo";

import Grid from "@material-ui/core/Grid";

import configContext from "../contexts/configContext";

const BotPanel = (props) => {
  // // manage config
  const {config, setConfig} = React.useContext(configContext);

  return (
    <Grid container spacing={3}>
      <Grid item xs>
        {config.panels.includes("properties") && <Properties bot={props.bot} />}
      </Grid>
      <Grid item xs>
        {config.panels.includes("play_file") && <PlayFile bot={props.bot} />}
      </Grid>
      <Grid item xs>
        {config.panels.includes("jump_to") && <JumpTo bot={props.bot} />}
      </Grid>
      <Grid item xs>
        {config.panels.includes("go_to") && <GoTo bot={props.bot} />}
      </Grid>
    </Grid>
  );
};

export default BotPanel;
