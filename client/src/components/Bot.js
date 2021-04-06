import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BotDataService from "../services/BotService";

const Bot = props => {
  const initialBotState = {
    uuid: null,
    name: "",
    room_url: ""
  };
  const [currentBot, setCurrentBot] = useState(initialBotState);
  const [message, setMessage] = useState("");

  const getBot = uuid => {
    BotDataService.get(uuid)
      .then(response => {
        setCurrentBot(response.data);
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  };

  useEffect(() => {
    getBot(props.match.params.uuid);
  }, [props.match.params.uuid]);

  const handleInputChange = event => {
    const { name, value } = event.target;
    setCurrentBot({ ...currentBot, [name]: value });
  };

  const updateBot = () => {
    BotDataService.update(currentBot.uuid, currentBot)
      .then(response => {
        console.log(response.data);
        setMessage("The bot was updated successfully!");
      })
      .catch(e => {
        console.log(e);
      });
  };

  const deleteBot = () => {
    BotDataService.remove(currentBot.uuid)
      .then(response => {
        console.log(response.data);
        props.history.push("/bots");
      })
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <div>
      {currentBot ? (
        <div className="edit-form">
          <h4>Bot</h4>
          <form>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={currentBot.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="room_url">Room Url</label>
              <input
                type="text"
                className="form-control"
                id="room_url"
                name="room_url"
                value={currentBot.room_url}
                onChange={handleInputChange}
              />
            </div>

          </form>

          <button className="badge badge-danger mr-2" onClick={deleteBot}>
            Delete
          </button>

          <button
            type="submit"
            className="badge badge-success"
            onClick={updateBot}
          >
            Update
          </button>
          <Link to={"/bots"} className="btn btn-primary">Bots list</Link>
          <p>{message}</p>
        </div>
      ) : (
        <div>
          <br />
          <p>Please click on a Bot...</p>
        </div>
      )}
    </div>
  );
};

export default Bot;
