import React, { useState, useEffect, useContext } from "react";
import BotDataService from "../../services/BotService";
import botsListContext from "../../contexts/botsListContext";
import selectedBotContext from "../../contexts/selectedBotContext";

import ConfirmDialog from "../utils/ConfirmDialog";
import SystemMessage from "../utils/SystemMessage";

import {
  Typography,
  TextField,
  Button,
  Card,
  CardActions,
  CardContent
} from "@material-ui/core";

const Properties = (props) => {

  // input name error
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState("");

  const [editMode, setEditMode] = useState(false);

  const {botsList, setBotsList} = useContext(botsListContext);

  const {selectedBot, setSelectedBot} = useContext(selectedBotContext);

  const [editedBot, setEditedBot] = useState(props.bot);

  useEffect(() => {
    setEditedBot(props.bot);
    setSelectedBot(props.bot);
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "name" && value.length > 26) {
      setNameError(true);
      setNameErrorMessage("26 chars max");
    }
    setEditedBot({ ...editedBot, [name]: value });
  };

  // actions
  const cancelUpdateBot = () => {
    setEditedBot(props.bot);
    setEditMode(false);
  };

  const updateBot = () => {
    setConfirmUpdateDialogLoading(true);
    BotDataService.update(editedBot.uuid, editedBot)
      .then((response) => {
        console.log("updated bot",response.data);
        setConfirmUpdateDialogLoading(false);
        setOpenUpdateConfirmDialog(false);
        setEditMode(false);
        setSelectedBot(editedBot);
      })
      .catch((e) => {
        console.log(e);
        setConfirmUpdateDialogLoading(false);
        setOpenUpdateConfirmDialog(false);
      });
  };

  const deleteBot = () => {
    setConfirmDeleteDialogLoading(true);
    BotDataService.remove(editedBot.uuid)
      .then((response) => {
        console.log("deleted bot",response.data);
        setConfirmUpdateDialogLoading(false);
        setOpenUpdateConfirmDialog(false);
        setEditMode(false);
        setBotsList();
        setSelectedBot(null);
        setEditedBot(null);
      })
      .catch((e) => {
        console.log(e);
        setConfirmUpdateDialogLoading(false);
        setOpenUpdateConfirmDialog(false);
      });
  };

  // confirmation
  const [openUpdateConfirmDialog, setOpenUpdateConfirmDialog] = useState(false);
  const [confirmUpdateDialogLoading, setConfirmUpdateDialogLoading] = useState(false);

  const confirmUpdateDialogYesClicked = () => {
    updateBot();
  };
  const confirmUpdateDialogCloseClicked = () => {
    setOpenUpdateConfirmDialog(false);
  };

  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [confirmDeleteDialogLoading, setConfirmDeleteDialogLoading] = useState(false);

  const confirmDeleteDialogYesClicked = () => {
    deleteBot();
  };
  const confirmDeleteDialogCloseClicked = () => {
    setOpenDeleteConfirmDialog(false);
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

  const editTemplate = (
    <div className="edit-bot">
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2">
            Edit Properties
          </Typography>
          <form noValidate autoComplete="off">
            <TextField
              inputRef={input => input && input.focus()}
              id="name"
              name="name"
              label="Name"
              value={editedBot.name}
              onChange={handleInputChange}
              error={nameError}
              helperText={nameErrorMessage}
              inputProps={{
                maxLength: 26,
              }}
            />
            <TextField
              id="room_url"
              name="room_url"
              label="Room url"
              value={editedBot.room_url}
              onChange={handleInputChange}
            />
          </form>
        </CardContent>
        <CardActions>
          <Button onClick={() => setOpenUpdateConfirmDialog(true)} color="primary" variant="contained">
            Save bot
          </Button>
          <Button onClick={() => setOpenDeleteConfirmDialog(true)} color="secondary" variant="contained">
            Delete
          </Button>
          <Button onClick={cancelUpdateBot} color="default" variant="contained">
            Cancel
          </Button>
        </CardActions>
      </Card>
      {/* Confirmation */}
      <ConfirmDialog
        open={openUpdateConfirmDialog}
        title="Confirm bot update ?"
        titleLoading="Updating bot..."
        contentText="Do you really want to update the bot ??"
        contentTextLoading="Please wait..."
        onYesClicked={() => confirmUpdateDialogYesClicked()}
        onCloseClicked={() => confirmUpdateDialogCloseClicked()}
        loading={confirmUpdateDialogLoading}
      />
      <ConfirmDialog
        open={openDeleteConfirmDialog}
        title="Confirm bot deletion ?"
        titleLoading="Deleting bot..."
        contentText="Do you really want to delete the bot ?"
        contentTextLoading="Please wait..."
        onYesClicked={() => confirmDeleteDialogYesClicked()}
        onCloseClicked={() => confirmDeleteDialogCloseClicked()}
        loading={confirmDeleteDialogLoading}
      />
    </div>
  );

  return <div className="bot-properties">{editMode ? editTemplate : displayTemplate}</div>;
};

export default Properties;
