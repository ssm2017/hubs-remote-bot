import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from "@material-ui/core";

import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';

// progress bar style
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

const ConfirmDialog = (props) => {
  const classes = useStyles();
  
  // let (
  //   open,
  //   title,
  //   titleLoading,
  //   contentText,
  //   contextTextLoading,
  //   onYesClicked
  //   onCloseClicked
  //   loading
  //   success
  // )

  // open
  const [open, setOpen] = React.useState(props.open);
  React.useEffect(()=>{
    setOpen(props.open);
  }, [props.open])

  const handleYesClicked = () => {
    props.onYesClicked();
    // setOpen(false);
  }

  const handleCloseConfirmation = () => {
    // setOpenConfirmation(false);
    props.onCloseClicked();
  };

  // manage progress bar
  const [loading, setLoading] = React.useState(props.loading);
  const [success, setSuccess] = React.useState(props.success);
  React.useEffect(()=>{
    setLoading(props.loading);
    console.log("loading triered", props.loading);
  }, [props.loading])
  React.useEffect(()=>{
    setSuccess(props.success);
  }, [props.success])

  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });
  return (
    <Dialog
        open={open}
        onClose={handleCloseConfirmation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{loading ? props.titleLoading : props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {loading ? props.contentTextLoading : props.contentText}</DialogContentText>
          </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            autoFocus color="secondary"
            disabled={loading}
            onClick={handleCloseConfirmation}
          >
            No
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={buttonClassname}
            disabled={loading}
            onClick={handleYesClicked}
          >
            Yes
          </Button>
          {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
        </DialogActions>
      </Dialog>
  );
}

export default ConfirmDialog;