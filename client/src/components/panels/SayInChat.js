import React from "react";
import BotDataService from "../../services/BotService";
import SystemMessage from "../utils/SystemMessage";
import selectedBotContext from "../../contexts/selectedBotContext";

import {
  TextField,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography

} from "@material-ui/core";

const SayInChat = () => {
  // system messages
  const initialSystemMessage = {
    message: null,
    status: 0,
  };
  const [currentSystemMessage, setCurrentSystemMessage] = React.useState(initialSystemMessage);

  const {selectedBot, setSelectedBot} = React.useContext(selectedBotContext);

  const [message, setMessage] = React.useState("");

  // text fields content
  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const sendMessage = () => {
    var data = {
      message, message
    };
    BotDataService.sayInChat(selectedBot.uuid, data)
    .then((response) => {
      console.log(response.data);
      setMessage("");
    })
    .catch((e) => {
      console.log(e.response);
      setCurrentSystemMessage(e.response.data.error);
    });
  }

  return (
    <Card>
      <CardContent>
      <Typography variant="h5" component="h2">
        Say in chat
      </Typography>
        {currentSystemMessage.message && (
          <SystemMessage level={currentSystemMessage.status} message={currentSystemMessage.message} />
        )}
        <form noValidate autoComplete="off">
          <TextField
            id="message"
            name="message"
            label="Message"
            value={message}
            onChange={handleInputChange}
          />
        </form>
      </CardContent>
      <CardActions>
        <Button
          onClick={sendMessage}
          color="primary"
          variant="contained"
          type="submit"
        >
          Send
        </Button>
      </CardActions>
    </Card>
  );
}

export default SayInChat;