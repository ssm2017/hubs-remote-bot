import React, { useState } from "react";
import BotDataService from "../../services/BotService";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const AddBot = (props) => {
  const initialBotState = {
    uuid: null,
    name: "",
    room_url: ""
  };

  const [bot, setBot] = useState(initialBotState);

  const [openConfirmation, setOpenConfirmation] = useState(false);

  const handleClickOpenConfirmation = () => {
    setOpenConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
  };

  const handleInputChange = event => {
    const { name, value } = event.target;
    setBot({ ...bot, [name]: value });
  };

  const saveBot = () => {
    handleCloseConfirmation();
    var data = {
      name: bot.name,
      room_url: bot.room_url
    };
    BotDataService.create(data)
      .then(response => {
        console.log("Bot from create a new bot", response.data[0]);
        props.onCreate(response.data[0]);
      })
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <div className="add-bot">
      <Card>
        <CardContent>
          <form noValidate autoComplete="off">
              <TextField
                id="name"
                name="name"
                value={bot.name}
                onChange={handleInputChange}
                label="Name"
              />
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
          <Button
            onClick={handleClickOpenConfirmation}
            color="primary"
            variant="contained"
          >
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
        <DialogTitle id="alert-dialog-title">{"Confirm bot creation?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you really want to create a new bot ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmation} autoFocus color="secondary" variant="contained">
            No
          </Button>
          <Button onClick={saveBot} color="primary" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddBot;
