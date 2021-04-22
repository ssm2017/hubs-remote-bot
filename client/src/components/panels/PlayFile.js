import React from "react";
import BotDataService from "../../services/BotService";
import SystemMessage from "../utils/SystemMessage";
import selectedBotContext from "../../contexts/selectedBotContext";

import {
  Button,
  Card,
  CardContent,
  Typography,
  InputLabel,
  FormControl,
  NativeSelect
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const PlayFile = () => {
  // system messages
  const initialSystemMessage = {
    message: null,
    status: 0,
  };
  const [currentSystemMessage, setCurrentSystemMessage] = React.useState(initialSystemMessage);

  const {selectedBot, setSelectedBot} = React.useContext(selectedBotContext);

  const classes = useStyles();
  const initialFileState = {
    filename: null,
  };
  const [jsonFiles, setJsonFiles] = React.useState([]);
  const [mp3Files, setMp3Files] = React.useState([]);

  const [currentJsonFile, setCurrentJsonFile] = React.useState(initialFileState);
  const [currentMp3File, setCurrentMp3File] = React.useState(initialFileState);

  React.useEffect(() => {
    getFiles();
  }, []);

  const getFiles = () => {
    BotDataService.getAssetsList()
    .then((response) => {
      setJsonFiles(response.data.json);
      setMp3Files(response.data.mp3);
      console.log(response.data);
    })
    .catch((e) => {
      console.log(e);
      setCurrentSystemMessage(e.response.data.error);
    });
  };

  const handleJsonInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentJsonFile({ ...currentJsonFile, [name]: value });
  };

  const handleMp3InputChange = (event) => {
    const { name, value } = event.target;
    setCurrentMp3File({ ...currentMp3File, [name]: value });
  };

  const playJson = () => {
    var data = {
      filename: currentJsonFile.filename,
    };
    BotDataService.playFile(selectedBot.uuid, data)
    .then((response) => {
      console.log(response.data);
      setCurrentJsonFile(initialFileState);
    })
    .catch((e) => {
      console.log(e);
      setCurrentJsonFile(initialFileState);
      setCurrentSystemMessage(e.response.data.error);
    });
  };

  const playMp3 = () => {
    var data = {
      filename: currentMp3File.filename,
    };
    BotDataService.playFile(selectedBot.uuid, data)
      .then((response) => {
        console.log(response.data);
        setCurrentMp3File(initialFileState);
      })
      .catch((e) => {
        console.log(e);
        setCurrentMp3File(initialFileState);
        setCurrentSystemMessage(e.response.data.error);
      });
  };

  const noJsonFilesAvailable = (
    <Alert elevation={6} variant="filled" severity="info">
      No animation file available on the server.
    </Alert>
  );

  const jsonFilesAvailable = (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel htmlFor="play_json">Select animation file</InputLabel>
      <NativeSelect
        value={currentJsonFile.filename || ""}
        onChange={handleJsonInputChange}
        inputProps={{
          name: "filename",
          id: "play_json",
          type: "text",
        }}
      >
        <option key={0} aria-label="None" value=""></option>
        {jsonFiles &&
          jsonFiles.map((filename, index) => (
            <option key={index + 1} value={filename}>
              {filename}
            </option>
          ))}
      </NativeSelect>
      {currentJsonFile.filename ? (
        <Button onClick={playJson} variant="contained">
          Play Json
        </Button>
      ) : (
        ""
      )}
    </FormControl>
  );

  const noAudioFilesAvailable = (
    <Alert elevation={6} variant="filled" severity="info">
      No audio file available on the server.
    </Alert>
  );

  const audioFilesAvailable = (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel htmlFor="play_mp3">Select audio file</InputLabel>
      <NativeSelect
        value={currentMp3File.filename || ""}
        onChange={handleMp3InputChange}
        inputProps={{
          name: "filename",
          id: "play_mp3",
          type: "text",
        }}
      >
        <option key={0} aria-label="None" value=""></option>
        {mp3Files &&
          mp3Files.map((filename, index) => (
            <option key={index + 1} value={filename}>
              {filename}
            </option>
          ))}
      </NativeSelect>
      {currentMp3File.filename ? (
        <Button onClick={playMp3} variant="contained">
          Play Mp3
        </Button>
      ) : (
        ""
      )}
    </FormControl>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
          Play File
        </Typography>
        {currentSystemMessage.message && (
          <SystemMessage level={currentSystemMessage.status} message={currentSystemMessage.message} />
        )}
        {jsonFiles.length ? jsonFilesAvailable : noJsonFilesAvailable}
        {mp3Files.length ? audioFilesAvailable : noAudioFilesAvailable}
      </CardContent>
    </Card>
  );
};

export default PlayFile;
