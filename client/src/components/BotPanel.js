import React from "react";
import Properties from "./panels/Properties";
import PlayFile from "./panels/PlayFile";
import JumpTo from "./panels/JumpTo";
import GoTo from "./panels/GoTo";
import SayInChat from "./panels/SayInChat";
import SpawnObjects from "./panels/SpawnObjects";

import Grid from "@material-ui/core/Grid";

import configContext from "../contexts/configContext";

const BotPanel = (props) => {
  // // manage config
  const {config, setConfig} = React.useContext(configContext);

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="flex-start"
      spacing={2}
    >
      
      {config.panels.includes("properties") &&
      <Grid item>
        <Properties bot={props.bot} />
      </Grid>
      }

      {config.panels.includes("play_file") &&
      <Grid item>
        <PlayFile bot={props.bot} />
      </Grid>
      }

      {config.panels.includes("jump_to") &&
      <Grid item>
        <JumpTo bot={props.bot} />
      </Grid>
      }

      {config.panels.includes("go_to") &&
      <Grid item>
        <GoTo bot={props.bot} />
      </Grid>
      }

      {config.panels.includes("say") &&
      <Grid item>
        <SayInChat bot={props.bot} />
      </Grid>
      }

      {config.panels.includes("spawn") &&
      <Grid item>
        <SpawnObjects bot={props.bot} />
      </Grid>
      }
      
    </Grid>
  );
};

export default BotPanel;
