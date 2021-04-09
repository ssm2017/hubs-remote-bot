import React, { useState, useContext } from "react";
import BotDataService from "../../services/BotService";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
// import { AppContext } from "../utils/botCreatedContext.js"

const AddBot = (props) => {
  const initialBotState = {
    uuid: null,
    name: "",
    room_url: ""
  };

  const [bot, setBot] = useState(initialBotState);

  const handleInputChange = event => {
    const { name, value } = event.target;
    setBot({ ...bot, [name]: value });
  };

  const saveBot = () => {
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
            onClick={saveBot}
            color="primary"
            variant="contained"
          >
            Create bot
          </Button>
          <Button
            href="/"
            color="primary"
            variant="contained"
          >
            Back to list
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};

export default AddBot;
