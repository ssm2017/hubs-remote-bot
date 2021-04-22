import React from "react";
import BotDataService from "../../services/BotService";
import SystemMessage from "../utils/SystemMessage";
import selectedBotContext from "../../contexts/selectedBotContext";
import ConfirmDialog from "../utils/ConfirmDialog";
import objectsListContext from "../../contexts/objectsListContext";

import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@material-ui/core";
import RefreshIcon from '@material-ui/icons/Refresh';

const useStyles = makeStyles((theme) => ({
  buttonProgress: {
    color: green[500],
  },
}));

const ObjectsList = () => {
  const classes = useStyles();

  // system message
  const initialSystemMessage = {
    message: null,
    status: 0,
  };
  const [currentSystemMessage, setCurrentSystemMessage] = React.useState(initialSystemMessage);

  const {selectedBot, setSelectedBot} = React.useContext(selectedBotContext);

  const {objectsList, setObjectsList} = React.useContext(objectsListContext);

  const [deleteInProgress, setDeleteInProgress] = React.useState(false);

  // actions
  const handleGetObjectsList = () => {
    setObjectsList();
  }

  React.useEffect(() => {
    setObjectsList();
  }, []);

  const deleteObjects = () => {
    if (!deleteInProgress) {
      setDeleteInProgress(true);
      BotDataService.deleteObjects(selectedBot.uuid)
      .then((response) => {
        console.log("Objects deleted");
        setDeleteInProgress(false);
        setObjectsList();
      })
      .catch((e) => {
        console.log("error deleting objects", e.response);
        setDeleteInProgress(false);
        setCurrentSystemMessage(e.response.data.error);
      });
    }
  }

  // delete confirmation
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = React.useState(false);

  const confirmDeleteDialogYesClicked = () => {
    setOpenDeleteConfirmDialog(false);
    deleteObjects();
  };
  const confirmDeleteDialogCloseClicked = () => {
    setOpenDeleteConfirmDialog(false);
  };

  const listTemplate = (
    <ul>
      {objectsList && objectsList.map((item, index) => (
        <li key={index}>{item.id}</li>
      ))}
    </ul>
  );

  const deleteButtonTemplate = (
    <div>
      {objectsList && objectsList.length ? (
        deleteInProgress ? (
          <div>
            <Typography component="p">Delete in progress</Typography>
            <CircularProgress size={24} className={classes.buttonProgress} />
          </div>  
        ): (
          <Button
            onClick={() => setOpenDeleteConfirmDialog(true)}
            color="secondary"
            variant="contained"
          >
            Delete objects
          </Button>
        )
      ) : ("")}
      <ConfirmDialog
        open={openDeleteConfirmDialog}
        title="Confirm objects deletion ?"
        contentText="Do you really want to delete the objects ?"
        onYesClicked={() => confirmDeleteDialogYesClicked()}
        onCloseClicked={() => confirmDeleteDialogCloseClicked()}
      />
    </div>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
         Objects list
        </Typography>
        <Typography component="p">
          Count: {objectsList.length}
        </Typography>
        {currentSystemMessage.message && (
        <SystemMessage level={currentSystemMessage.status} message={currentSystemMessage.message} />
        )}
        {objectsList && objectsList.length ? listTemplate : "No object found."}
      </CardContent>
      <CardActions>
        <Button
          color="primary"
          variant="contained"
          onClick={handleGetObjectsList}
        >
        <RefreshIcon />
        Refresh
        </Button>
        {deleteButtonTemplate}
      </CardActions>
    </Card>
  )
}

export default ObjectsList;