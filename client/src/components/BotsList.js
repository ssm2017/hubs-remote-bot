import React, { useState, useEffect, useContext } from "react";

import botsListContext from "../contexts/botsListContext";
import selectedBotContext from "../contexts/selectedBotContext";
// import BotsListContextProvider from '../contexts/BotsListContextProvider';

import BotPanel from "./BotPanel";
import AddBot from "./panels/AddBot";

import {
  AppBar,
  Checkbox,
  CssBaseline,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";

import {
  Menu as MenuIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Accessibility as AccessibilityIcon,
  MoreVert as MoreVertIcon,
} from "@material-ui/icons";

import SystemMessage from "./utils/SystemMessage";
import useStickyState from "./utils/useStickyState";

const drawerWidth = 200;
const autoRefresh = false;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
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
  moreButton: {
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.up("sm")]: {
      marginRight: "200px",
    },
  },
  title: {
    flexGrow: 1,
  },
}));

const BotsList = (props) => {
  // manage config
  const [configAutorefresh, setConfigAutorefresh] = useStickyState(false, "enableAutoRefresh");

  // theming
  const classes = useStyles();

  const {botsList, setBotsList} = useContext(botsListContext);
  // get the bots list on init
  useEffect(() => {
    if (configAutorefresh) {
      const interval = setInterval(() => {
        setBotsList();
      }, 2000 );
      return () => clearInterval(interval);
    }
    setBotsList();
  }, []);

  // selected bot
  const initialCurrentBotState = {
    uuid: null,
    name: "",
    room_url: "",
  };
  const {selectedBot, setSelectedBot} = useContext(selectedBotContext);
  const [selectedBotIndex, setSelectedBotIndex] = useState(-1);
  const selectBot = (bot, index) => {
    if (showMobileMenu) {
      handleBotsListDrawerToggle();
    }
    if (newBotOpenned) {
      setnewBotOpenned(false);
    }
    setSelectedBot(bot);
    setSelectedBotIndex(index);
  };

  // new bot created
  const onHandleNewBotCreated = (bot) => {
    // retrieveBots();
    setBotsList();
    setnewBotOpenned(false);
  };
  const [newBotOpenned, setnewBotOpenned] = useState(false);
  const handleOpenNewBot = () => {
    if (showMobileMenu) {
      handleBotsListDrawerToggle();
    }
    setSelectedBot(initialCurrentBotState);
    setSelectedBotIndex(-1);
    setnewBotOpenned(true);
  };

  // drawers
  const { window } = props;
  const container = window !== undefined ? () => window().document.body : undefined;

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const handleBotsListDrawerToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const [showMobileTools, setShowMobileTools] = useState(false);
  const handleToolsDrawerToggle = () => {
    setShowMobileTools(!showMobileTools);
  };

  // useEffect(() => {
  // }, [showMobileTools]);

  const botsListDrawer = (
    <div>
      <div className={classes.toolbar} />
      <List>
        <ListItem button onClick={() => handleOpenNewBot()}>
          <ListItemIcon>
            <AddCircleOutlineIcon />
          </ListItemIcon>
          <ListItemText primary="New bot" />
        </ListItem>
      </List>
      <Divider />
      <List>
        {botsList &&
          botsList.map((bot, index) => (
            <ListItem button key={index} onClick={() => selectBot(bot, index)} selected={selectedBotIndex === index}>
              <ListItemIcon>
                <AccessibilityIcon />
              </ListItemIcon>
              <ListItemText primary={bot.name} />
            </ListItem>
          ))}
      </List>
    </div>
  );

  const mobileMenuTemplate = (
    <Drawer
      container={container}
      variant="temporary"
      anchor="left"
      open={showMobileMenu}
      onClose={handleBotsListDrawerToggle}
      classes={{
        paper: classes.drawerPaper,
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {botsListDrawer}
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
      >
        {botsListDrawer}
      </Drawer>
    </div>
  );

  const noBotTemplate = (
    <div className="empty-botsList">
      <SystemMessage level="warning" message="No bot found." />
      <AddBot
        onCreate={(bot) => {
          onHandleNewBotCreated(bot);
        }}
      />
    </div>
  );

  const mainContentTemplate = (
    <div className={classes.content}>
      <div className={classes.toolbar} />
      {newBotOpenned ? (
        <AddBot
          onCreate={(bot) => {
            onHandleNewBotCreated(bot);
          }}
        />
      ) : selectedBot.uuid ? (
        <BotPanel
          onToggleTools={(status) => {
            setShowMobileTools(status);
          }}
          showToolsMenu={showMobileTools}
          bot={selectedBot}
        />
      ) : (
        <SystemMessage level="info" message="Please select a bot..." />
      )}
    </div>
  );

  const appBar = (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleBotsListDrawerToggle}
          className={classes.menuButton}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap className={classes.title}>
          Hubs Bots Remote({botsList.length}) {selectedBot.name ? " : " + selectedBot.name : ""}
        </Typography>
        {selectedBot.uuid && (
          <IconButton
            color="inherit"
            aria-label="open tools"
            edge="end"
            onClick={handleToolsDrawerToggle}
            className={classes.moreButton}
          >
            <MoreVertIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );

  const botsListTemplate = (
    <div className={classes.root}>
      <CssBaseline />
      {appBar}
      <nav className={classes.drawer}>
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          {mobileMenuTemplate}
        </Hidden>

        <Hidden xsDown implementation="css">
          {desktopMenuTemplate}
        </Hidden>
      </nav>

      {/* Main Content */}
      {mainContentTemplate}
    </div>
  );

  return (
    <div className="botsList">{botsList.length ? botsListTemplate : noBotTemplate}</div>
  );
};

export default BotsList;
