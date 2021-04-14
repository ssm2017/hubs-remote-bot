import React, { useState, useEffect, useContext } from "react";
import BotDataService from "../../services/BotService";
import botsListContext from "../../contexts/botsListContext";
import selectedBotContext from "../../contexts/selectedBotContext";

import Typography from "@material-ui/core/Typography";
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

const Properties = (props) => {
  const [editMode, setEditMode] = useState(false);

  const {botsList, setBotsList} = useContext(botsListContext);

  const {selectedBot, setSelectedBot} = useContext(selectedBotContext);
  // const [selectedBot, setSelectedBot] = useState(props.bot);
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSelectedBot({ ...selectedBot, [name]: value });
  };
  useEffect(() => {
    console.log("props", props.bot);
    setSelectedBot(props.bot);
  }, []);

  // confirmation
  const [openUpdateConfirmation, setOpenUpdateConfirmation] = useState(false);
  const handleClickOpenUpdateConfirmation = () => {
    setOpenUpdateConfirmation(true);
  };
  const handleCloseUpdateConfirmation = () => {
    setOpenUpdateConfirmation(false);
  };
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const handleClickOpenDeleteConfirmation = () => {
    setOpenDeleteConfirmation(true);
  };
  const handleCloseDeleteConfirmation = () => {
    setOpenDeleteConfirmation(false);
  };

  // actions
  const cancelUpdateBot = () => {
    setSelectedBot(props.bot);
    setEditMode(false);
  };

  const updateBot = () => {
    handleCloseUpdateConfirmation();
    console.log("update bot", selectedBot);
    BotDataService.update(selectedBot.uuid, selectedBot)
      .then((response) => {
        console.log(response.data);
        setEditMode(false);
        setBotsList();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const deleteBot = () => {
    handleCloseDeleteConfirmation();
    
    console.log("delete bot", selectedBot);
    BotDataService.remove(selectedBot.uuid)
      .then((response) => {
        console.log(response.data);
        setEditMode(false);
        setBotsList();
        setSelectedBot(null);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const displayTemplate = (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
          Properties
        </Typography>
        <dl>
          <dt>Uuid</dt>
          <dd>{selectedBot.uuid}</dd>
          <dt>Name</dt>
          <dd>{selectedBot.name}</dd>
          <dt>Room Url</dt>
          <dd>{selectedBot.room_url}</dd>
        </dl>
      </CardContent>
      <CardActions>
        <Button onClick={() => setEditMode(true)} variant="contained" color="primary">
          Edit
        </Button>
      </CardActions>
    </Card>
  );

  const updateConfirmationTemplate = (
    <Dialog
      open={openUpdateConfirmation}
      onClose={handleCloseUpdateConfirmation}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Confirm bot update ?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">Do you really want to update the bot ?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseUpdateConfirmation} autoFocus color="secondary" variant="contained">
          No
        </Button>
        <Button onClick={updateBot} color="primary" variant="contained">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );

  const deleteConfirmationTemplate = (
    <Dialog
      open={openDeleteConfirmation}
      onClose={handleCloseDeleteConfirmation}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Confirm bot deletion ?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">Do you really want to delete the bot ?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDeleteConfirmation} autoFocus color="secondary" variant="contained">
          No
        </Button>
        <Button onClick={deleteBot} color="primary" variant="contained">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );

  const editTemplate = (
    <div className="edit-bot">
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2">
            Edit Properties
          </Typography>
          <form noValidate autoComplete="off">
            <TextField id="name" name="name" value={selectedBot.name} onChange={handleInputChange} label="Name" />
            <TextField
              id="room_url"
              name="room_url"
              value={selectedBot.room_url}
              onChange={handleInputChange}
              label="Room url"
            />
          </form>
        </CardContent>
        <CardActions>
          <Button onClick={handleClickOpenUpdateConfirmation} color="primary" variant="contained">
            Save bot
          </Button>
          <Button onClick={handleClickOpenDeleteConfirmation} color="secondary" variant="contained">
            Delete
          </Button>
          <Button onClick={cancelUpdateBot} color="default" variant="contained">
            Cancel
          </Button>
        </CardActions>
      </Card>
      {/* Confirmation */}
      {updateConfirmationTemplate}
      {deleteConfirmationTemplate}
    </div>
  );

  return <div className="bot-properties">{editMode ? editTemplate : displayTemplate}</div>;
};

export default Properties;
