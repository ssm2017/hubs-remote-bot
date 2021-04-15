import React, { useState, useEffect, useContext } from "react";
import Properties from "./panels/Properties";
import PlayFile from "./panels/PlayFile";
import JumpTo from "./panels/JumpTo";
import GoTo from "./panels/GoTo";

import {
  Checkbox,
  Drawer,
  Hidden,
  FormControl,
  FormLabel,
  FormGroup,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  makeStyles,
  Grid,
} from "@material-ui/core";

import configContext from "../contexts/configContext";

const TOOLS_DRAWER_WIDTH = 200;

const useStyles = makeStyles((theme) => ({
  fab: {
    margin: 0,
    top: "auto",
    right: 20,
    bottom: 20,
    left: "auto",
    position: "fixed",
  },
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: TOOLS_DRAWER_WIDTH,
      flexShrink: 0,
    },
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: TOOLS_DRAWER_WIDTH,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  title: {
    flexGrow: 1,
  },
  toolsPanel: {
    marginTop: "100px",
    padding: "10px",
  },
}));

const panelsList = [
  {
    command: "properties",
    title: "Properties",
  },
  {
    command: "play_file",
    title: "Play file",
  },
  {
    command: "jump_to",
    title: "Jump to",
  },
  {
    command: "go_to",
    title: "Go to",
  },
];

const BotPanel = (props) => {
  const classes = useStyles();

  // manage config
  const {config, setConfig} = useContext(configContext);
  const handleToggleConfigAutorefresh = (event) => {
    setConfig("enableAutoRefresh", event.target.checked);
  }
  const [soloMode, setSoloMode] = useState(false);
  const handleToggleConfigSoloMode = (event) => {
    setSoloMode(event.target.checked);
    if (config.panels.length >1) {
      setConfig("panels", ["properties"]);
    }
  }
  useEffect(() => {
    setConfig("soloMode", soloMode);
  }, [soloMode]);

  // tools menu
  const [showMobileTools, setShowMobileTools] = useState(props.showToolsMenu);
  useEffect(() => {
    setShowMobileTools(props.showToolsMenu);
  }, [props.showToolsMenu]);

  const handleToolsDrawerToggle = () => {
    setShowMobileTools(!showMobileTools);
    props.onToggleTools(!showMobileTools);
  };

  const handleToolsDisplayListChange = (event) => {
    if (config.soloMode) {
      setConfig("panels", [event.target.name]);
    } else {
      // remove if exist
      const idx = config.panels.indexOf(event.target.name);
      if (idx > -1) {
        let newArray = config.panels.filter(function (ele) {
          return ele !== event.target.name;
        });
        setConfig("panels", newArray);
      } else {
        // add a new one
        setConfig("panels", [...config.panels, event.target.name]);
      }
    }
  };

  const toolsPanel = (
    <div className={classes.toolsPanel}>
      <FormControlLabel
        label="Auto refresh"
        control={<Checkbox
          key="toggleAutoRefresh"
          checked={config.enableAutoRefresh}
          name="auto_refresh"
          onChange={handleToggleConfigAutorefresh} />}
      />
      <FormHelperText>Need page refresh</FormHelperText>
      <FormControlLabel
        label="Solo mode"
        control={<Switch
          key="toggleSoloMode"
          checked={config.soloMode}
          name="solo_mode"
          color="primary" />}
          onChange={handleToggleConfigSoloMode}
      />
      {config.soloMode ? (
        <FormControl component="fieldset">
          <FormLabel component="legend">Select panel</FormLabel>
          <RadioGroup
            aria-label="panels"
            name="panels"
            onChange={(event) => handleToolsDisplayListChange(event)}
          >
            {panelsList.map((panel, index) => (
              <FormControlLabel
                key={index}
                value={panel.command}
                label={panel.title}
                control={<Radio
                  key={index}
                  name={panel.command}
                  checked={config.panels.includes(panel.command)}
                />}
              />
            ))}
          </RadioGroup>
        </FormControl>
      ) : (
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Select panels</FormLabel>
          <FormGroup onChange={(event) => handleToolsDisplayListChange(event)}>
            {panelsList.map((panel, index) => (
              <FormControlLabel
                key={index}
                label={panel.title}
                control={
                  <Checkbox
                    key={index}
                    name={panel.command}
                    checked={config.panels.includes(panel.command)}
                  />
                }
              />
            ))}
          </FormGroup>
        </FormControl>
      )}
    </div>
  );

  const mobileMenuTemplate = (
    <Drawer
      // container={container}
      variant="temporary"
      anchor="right"
      open={showMobileTools}
      onClose={handleToolsDrawerToggle}
      classes={{
        paper: classes.drawerPaper,
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {toolsPanel}
    </Drawer>
  );

  const desktopMenuTemplate = (
    <div>
      <Drawer
        classes={{
          paper: classes.drawerPaper,
        }}
        variant="permanent"
        open
        anchor="right"
      >
        {toolsPanel}
      </Drawer>
    </div>
  );

  return (
    <div className="botpanel">
      <nav className={classes.drawer}>
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          {mobileMenuTemplate}
        </Hidden>

        <Hidden xsDown implementation="css">
          {desktopMenuTemplate}
        </Hidden>
      </nav>

      <div className="container">
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
      </div>
    </div>
  );
};

export default BotPanel;
