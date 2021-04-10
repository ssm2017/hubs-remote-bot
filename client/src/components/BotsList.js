import React, { useState, useEffect } from "react";
import BotDataService from "../services/BotService";
import BotPanel from "./BotPanel";
import AddBot from "./panels/AddBot";

import {
  AppBar,
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
  useTheme
} from '@material-ui/core';

import {
  Menu as MenuIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Accessibility as AccessibilityIcon
} from '@material-ui/icons';

import SystemMessage from './utils/SystemMessage';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
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
  },
}));

const BotsList = (props) => {

  // on init
  useEffect(() => {
    retrieveBots();
  }, []);

  // botsList list
  const [botsList, setBotsList] = useState([]);
  const retrieveBots = () => {
    return BotDataService.getAll()
      .then(response => {
        setBotsList(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  };
  const refreshList = () => {
    retrieveBots();
    setCurrentBot(initialCurrentBotState);
  };
  // selected bot
  const initialCurrentBotState = {
    uuid: null,
    name: "",
    room_url: ""
  };
  const [currentBot, setCurrentBot] = useState(initialCurrentBotState);
  const [selectedBotIndex, setSelectedBotIndex] = useState(-1);
  const selectBot = (bot, index) => {
    if (mobileMode) {
      handleDrawerToggle();
    }
    if (newBotOpenned) {
      setnewBotOpenned(false);
    }
    setCurrentBot(bot);
    setSelectedBotIndex(index);
  };
  const autoSelectBot = () => {
    console.log("a faire");
  }

  // new bot created
  const onHandleNewBotCreated = (bot) => {
    retrieveBots();
    setnewBotOpenned(false);
  }
  const [newBotOpenned, setnewBotOpenned] = useState(false);
  const handleOpenNewBot = () => {
    if (mobileMode) {
      handleDrawerToggle();
    }
    setCurrentBot(initialCurrentBotState);
    setSelectedBotIndex(-1);
    setnewBotOpenned(true);
  }

  // theming
  const classes = useStyles();
  const theme = useTheme();
  // drawer
  const { window } = props;
  const [mobileMode, setmobileMode] = useState(false);
  const container = window !== undefined ? () => window().document.body : undefined;
  const handleDrawerToggle = () => {
    setmobileMode(!mobileMode);
  };

  const drawer = (
    <div>
      <div className={classes.toolbar} />
        <List>
          <ListItem button
            onClick={() => handleOpenNewBot()}
            >
            <ListItemIcon><AddCircleOutlineIcon /></ListItemIcon>
            <ListItemText primary="New bot" />
          </ListItem>
        </List>
        <Divider />
        <List>
      {botsList && botsList.map((bot, index) => (
        <ListItem button
          key={index}
          onClick={() => selectBot(bot, index)}
          selected={selectedBotIndex === index}
          >
          <ListItemIcon><AccessibilityIcon /></ListItemIcon>
          <ListItemText primary={bot.name} />
        </ListItem>
        ))}
      </List>
    </div>
  );

  const desktopMenuTemplate = (
    <Drawer
      container={container}
      variant="temporary"
      anchor='left'
      open={mobileMode}
      onClose={handleDrawerToggle}
      classes={{
        paper: classes.drawerPaper,
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {drawer}
    </Drawer>
  );

  const mobileMenuTemplate = (
    <Drawer
      classes={{
        paper: classes.drawerPaper,
      }}
      variant="permanent"
      open
    >
      {drawer}
    </Drawer>
  );

  const noBotTemplate = (
    <div className="empty-botsList">
      <SystemMessage level="warning" message="No bot found." />
      <AddBot onCreate={(bot) => {onHandleNewBotCreated(bot)}}/>
    </div>
  );

  const mainContentTemplate = (
    <div className={classes.content}>
        <div className={classes.toolbar} />
        {newBotOpenned ? (
          <AddBot onCreate={(bot) => {onHandleNewBotCreated(bot)}}/>
        ) : (
          currentBot.uuid ? (
              <BotPanel bot={currentBot}/>
          ) : (
            <SystemMessage level="info" message="Please select a bot..." />
          )
        )}
      </div>
  );

  const botsListTemplate = (
      <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Hubs Bots Remote{currentBot.name ? " : " + currentBot.name : ''}
          </Typography>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          {desktopMenuTemplate}
        </Hidden>
        
        <Hidden xsDown implementation="css">
          {mobileMenuTemplate}
        </Hidden>
      </nav>

      {/* Main Content */}
      {mainContentTemplate}
  </div>
  );

  return <div className="botsList">{botsList.length ? botsListTemplate : noBotTemplate}</div>;
};

export default BotsList;
