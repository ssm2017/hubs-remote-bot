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
    room_url: ""
  };
  const [bot, setBot] = React.useState(initialBotState);

  // text fields content
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "name" && value.length > 26) {
      setNameError(true);
      setNameErrorMessage("26 chars max");
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
              }}
            />
            <TextField
              id="room_url"
              name="room_url"
              label="Room url"
              value={bot.room_url}
              onChange={handleInputChange}
            />
          </form>
        </CardContent>
        <CardActions>
          <Button
            onClick={handleOpenConfirmDialog}
            color="primary"
            variant="contained"
            type="submit"
          >
            Create bot
          </Button>
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
