import React, { useState } from "react";
import BotDataService from "../../services/BotService";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';

// progress bar style
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

const AddBot = (props) => {
  const classes = useStyles();

  // init values
  const initialBotState = {
    uuid: null,
    name: "",
    room_url: ""
  };
  const [bot, setBot] = useState(initialBotState);

  // text fields content
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBot({ ...bot, [name]: value });
  };

  // save the bot
  const saveBot = () => {
    if (!loading) {
      setSuccess(false);
      setLoading(true);
      var data = {
        name: bot.name,
        room_url: bot.room_url,
      };
      BotDataService.create(data)
      .then((response) => {
        setSuccess(true);
        setLoading(false);
        handleCloseConfirmation();
        props.onCreate(response.data[0]);
      })
      .catch((e) => {
        console.log(e);
        setSuccess(false);
        setLoading(false);
        handleCloseConfirmation();
      });
    }
      
  };

  // manage confirmation
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const handleClickOpenConfirmation = () => {
    setOpenConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
  };

  // manage progress bar
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });

  return (
    <div className="add-bot">
      <Card>
        <CardContent>
          <form noValidate autoComplete="off">
            <TextField id="name" name="name" value={bot.name} onChange={handleInputChange} label="Name" />
            <TextField
              id="room_url"
              name="room_url"
              value={bot.room_url}
              onChange={handleInputChange}
              label="Room url"
            />
          </form>
        </CardContent>
        <CardActions>
          <Button onClick={handleClickOpenConfirmation} color="primary" variant="contained">
            Create bot
          </Button>
        </CardActions>
      </Card>
      {/* Confirmation */}
      <Dialog
        open={openConfirmation}
        onClose={handleCloseConfirmation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{loading ? "Creating bot" : "Confirm bot creation?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {loading ? `Please wait`:`Do you really want to create a new bot ?`}</DialogContentText>
          </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConfirmation}
            autoFocus color="secondary"
            variant="contained"
            disabled={loading}
          >
            No
          </Button>
          {/* <Button onClick={saveBot} color="primary" variant="contained">
            Yes
          </Button> */}
          <Button
            variant="contained"
            color="primary"
            className={buttonClassname}
            disabled={loading}
            onClick={saveBot}
          >
            Yes
          </Button>
          {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddBot;
