import React, { useState } from "react";
import BotDataService from "../services/BotService";

const AddBot = () => {
  const initialBotState = {
    uuid: null,
    name: "",
    room_url: ""
  };
  const [bot, setBot] = useState(initialBotState);
  const [submitted, setSubmitted] = useState(false);

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
        setBot({
          uuid: response.data.uuid,
          name: response.data.name,
          room_url: response.data.room_url
        });
        setSubmitted(true);
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const newBot = () => {
    setBot(initialBotState);
    setSubmitted(false);
  };

  return (
    <div className="submit-form">
      {submitted ? (
        <div>
          <h4>You submitted successfully!</h4>
          <button className="btn btn-success" onClick={newBot}>
            Add
          </button>
        </div>
      ) : (
        <div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              required
              value={bot.name}
              onChange={handleInputChange}
              name="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="room_url">Room Url</label>
            <input
              type="text"
              className="form-control"
              id="room_url"
              required
              value={bot.room_url}
              onChange={handleInputChange}
              name="room_url"
            />
          </div>

          <button onClick={saveBot} className="btn btn-success">
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default AddBot;
