import React from "react";

import {
  Checkbox,
  Divider,
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
  Typography,
} from "@material-ui/core";

import configContext from "../contexts/configContext";
import selectedBotContext from "../contexts/selectedBotContext";

const TOOLS_DRAWER_WIDTH = 200;

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
  {
    command: "say",
    title: "Say in chat",
  },
  {
    command: "spawn",
    title: "Spawn objects",
  },
  {
    command: "objects",
    title: "Objects list",
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: TOOLS_DRAWER_WIDTH,
      flexShrink: 0,
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  mobileToolbarHeader: {
    padding: "10px",
    textAlign: "center",
  },
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
    margin: "10px",
  },
}));

const ConfigPanel = (props) => {
  const classes = useStyles();

  // selected bot
  const { selectedBot, setSelectedBot } = React.useContext(selectedBotContext);

  // manage config
  const { config, setConfig } = React.useContext(configContext);
  const handleToggleConfigAutorefresh = (event) => {
    setConfig("enableAutoRefresh", event.target.checked);
  };
  const [soloMode, setSoloMode] = React.useState(config.soloMode);
  const handleToggleConfigSoloMode = (event) => {
    setSoloMode(event.target.checked);
    if (config.panels.length > 1) {
      setConfig("panels", ["properties"]);
    }
  };
  React.useEffect(() => {
    setConfig("soloMode", soloMode);
  }, [soloMode]);

  // tools menu
  const [showMobileTools, setShowMobileTools] = React.useState(props.showToolsMenu);
  React.useEffect(() => {
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

  const configPanelTemplate = (
    <div className={classes.toolsPanel}>
      <FormControlLabel
        label="Auto refresh"
        control={
          <Checkbox
            key="toggleAutoRefresh"
            checked={config.enableAutoRefresh}
            name="auto_refresh"
            onChange={handleToggleConfigAutorefresh}
          />
        }
      />
      <FormHelperText>Need page refresh</FormHelperText>
    </div>
  );

  const toolsPanelTemplate = (
    <div className={classes.toolsPanel}>
      <FormControlLabel
        label="Solo mode"
        control={<Switch key="toggleSoloMode" checked={config.soloMode} name="solo_mode" color="primary" />}
        onChange={handleToggleConfigSoloMode}
      />
      {config.soloMode ? (
        <FormControl component="fieldset">
          <FormLabel component="legend">Select panel</FormLabel>
          <RadioGroup aria-label="panels" name="panels" onChange={(event) => handleToolsDisplayListChange(event)}>
            {panelsList.map((panel, index) => (
              <FormControlLabel
                key={index}
                value={panel.command}
                label={panel.title}
                control={<Radio key={index} name={panel.command} checked={config.panels.includes(panel.command)} />}
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
                control={<Checkbox key={index} name={panel.command} checked={config.panels.includes(panel.command)} />}
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
      <div className={classes.mobileToolbarHeader}>
        <Typography variant="h5" component="h2">
          Config
        </Typography>
      </div>
      <Divider />
      {configPanelTemplate}
      <Divider />
      {selectedBot.uuid && toolsPanelTemplate}
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
        <div className={classes.toolbar} />
        {configPanelTemplate}
        <Divider />
        {selectedBot.uuid && toolsPanelTemplate}
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
    </div>
  );
};

export default ConfigPanel;
