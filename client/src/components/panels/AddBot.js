import React from "react";
import BotDataService from "../../services/BotService";

import ConfirmDialog from "../utils/ConfirmDialog";
import SystemMessage from "../utils/SystemMessage";

import {
  TextField,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography

} from "@material-ui/core";

const AddBot = (props) => {

  // input name error
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState("");

  // system message
  const [systemMessage, setSystemMessage] = React.useState({
    visible: false,
    level: null,
    message: null
  });

  // init values
  const initialBotState = {
    uuid: null,
    name: "",
    room_url: "",
    avatar_id: ""
  };
  const [bot, setBot] = React.useState(initialBotState);

  // text fields content
  const handleInputChange = (event) => {
    setNameError(false);
    setNameErrorMessage("");
    const { name, value } = event.target;
    if (name === "name") {
      if (!value.match("^[A-Za-z0-9 -]{0,26}$")) {
        setNameError(true);
        setNameErrorMessage("Only alphanumerics, hyphens, underscores, and tildes. At least 1 characters, no more than 26");
      }
    }
    setBot({ ...bot, [name]: value });
  };

  // save the bot
  const saveBot = () => {
    if (!confirmDialogLoading) {
      setConfirmDialogLoading(true);
      var data = {
        name: bot.name,
        room_url: bot.room_url,
      };
      BotDataService.create(data)
      .then((response) => {
        setConfirmDialogLoading(false);
        setOpenConfirmDialog(false);
        props.onCreate(response.data[0]);
        setSystemMessage({
          visible: true,
          level: 200,
          message: "Bot saved."
        });
      })
      .catch((e) => {
        console.log(e);
        setConfirmDialogLoading(false);
        setOpenConfirmDialog(false);
        setSystemMessage({
          visible: true,
          level: "error",
          message: JSON.stringify(e.response)
        });
      });
    }
  };

  // confirmDialog
  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
  const [confirmDialogLoading, setConfirmDialogLoading] = React.useState(false);

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  }

  const confirmDialogYesClicked = () => {
    saveBot();
  }

  const confirmDialogCloseClicked = () => {
    setOpenConfirmDialog(false);
    setConfirmDialogLoading(false);
  }

  return (
    <div className="add-bot">
      <Card>
        <CardContent>
        <Typography variant="h5" component="h2">
          Add bot
        </Typography>
          {systemMessage.visible &&
            <SystemMessage level={systemMessage.level} message={systemMessage.message} />
          }
          <form noValidate autoComplete="off">
            <TextField
              inputRef={input => input && input.focus()}
              id="name"
              name="name"
              label="Name"
              value={bot.name}
              onChange={handleInputChange}
              error={nameError}
              helperText={nameErrorMessage}
              inputProps={{
                maxLength: 26,
                pattern: "^[A-Za-z0-9 -]{0,26}$"
              }}
            />
            <TextField
              id="room_url"
              name="room_url"
              label="Room url"
              value={bot.room_url}
              onChange={handleInputChange}
            />
            <TextField
              id="avatar_id"
              name="avatar_id"
              label="Avatar id"
              value={bot.avatar_id}
              onChange={handleInputChange}
            />
          </form>
        </CardContent>
        <CardActions>
          {!nameError &&
            <Button
            onClick={handleOpenConfirmDialog}
            color="primary"
            variant="contained"
            type="submit"
          >
            Create bot
          </Button>
          }
        </CardActions>
      </Card>
      <ConfirmDialog
        open={openConfirmDialog}
        title="Confirm bot creation ?"
        titleLoading="Saving bot..."
        contentText="Do you really want to create a new bot ?"
        contentTextLoading="Please wait..."
        onYesClicked={() => confirmDialogYesClicked()}
        onCloseClicked={() => confirmDialogCloseClicked()}
        loading={confirmDialogLoading}
      />
    </div>
  );
};

export default AddBot;
