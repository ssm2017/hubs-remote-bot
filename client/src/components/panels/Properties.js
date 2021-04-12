import React, { useState } from "react";
import BotDataService from "../../services/BotService";

import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const Properties = props => {
	const [editMode, setEditMode] = useState(false);

	const [currentBot, setCurrentBot] = useState(props.bot);
	const handleInputChange = event => {
		const { name, value } = event.target;
		setCurrentBot({ ...currentBot, [name]: value });
	  };
	
	// confirmation
	const [openUpdateConfirmation, setOpenUpdateConfirmation] = useState(false);
	const handleClickOpenUpdateConfirmation = () => {
		setOpenUpdateConfirmation(true);
	};
	const handleCloseUpdateConfirmation = () => {
		setOpenUpdateConfirmation(false);
	};
	const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
	const handleClickOpenDeleteConfirmation = () => {
		setOpenDeleteConfirmation(true);
	};
	const handleCloseDeleteConfirmation = () => {
		setOpenDeleteConfirmation(false);
	};

	// actions
	const cancelUpdateBot = () => {
		setCurrentBot(props.bot);
		setEditMode(false);
	}

	const updateBot = () => {
		handleCloseUpdateConfirmation();
		setEditMode(false);
		console.log("update bot", currentBot);
		BotDataService.update(currentBot.uuid, currentBot)
		.then(response => {
			console.log(response.data);
		})
		.catch(e => {
			console.log(e);
		});
	};

	const deleteBot = () => {
		handleCloseDeleteConfirmation();
		setEditMode(false);
		console.log("delete bot", currentBot);
		BotDataService.remove(currentBot.uuid)
		.then(response => {
			console.log(response.data);
			props.history.push("/bots");
		})
		.catch(e => {
			console.log(e);
		});
	};

	const displayTemplate = (
		<Card>
			<CardContent>
				<Typography variant="h5" component="h2">Properties</Typography>
				<dl>
					<dt>Uuid</dt>
						<dd>{currentBot.uuid}</dd>
					<dt>Name</dt>
						<dd>{currentBot.name}</dd>
					<dt>Room Url</dt>
						<dd>{currentBot.room_url}</dd>
				</dl>
			</CardContent>
			<CardActions>
				<Button
					onClick={() => setEditMode(true)}
					variant="contained"
					color="primary"
					>
					Edit
				</Button>
			</CardActions>
		</Card>
	);

	const updateConfirmationTemplate = (
		<Dialog
			open={openUpdateConfirmation}
			onClose={handleCloseUpdateConfirmation}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{"Confirm bot update ?"}</DialogTitle>
			<DialogContent>
			<DialogContentText id="alert-dialog-description">
				Do you really want to update the bot ?
			</DialogContentText>
			</DialogContent>
			<DialogActions>
			<Button onClick={handleCloseUpdateConfirmation} autoFocus color="secondary" variant="contained">
				No
			</Button>
			<Button onClick={updateBot} color="primary" variant="contained">
				Yes
			</Button>
			</DialogActions>
		</Dialog>
	);

	const deleteConfirmationTemplate = (
		<Dialog
			open={openDeleteConfirmation}
			onClose={handleCloseDeleteConfirmation}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{"Confirm bot deletion ?"}</DialogTitle>
			<DialogContent>
			<DialogContentText id="alert-dialog-description">
				Do you really want to delete the bot ?
			</DialogContentText>
			</DialogContent>
			<DialogActions>
			<Button onClick={handleCloseDeleteConfirmation} autoFocus color="secondary" variant="contained">
				No
			</Button>
			<Button onClick={deleteBot} color="primary" variant="contained">
				Yes
			</Button>
			</DialogActions>
		</Dialog>
	);

	const editTemplate = (
		<div className="edit-bot">
			<Card>
				<CardContent>
				<Typography variant="h5" component="h2">Edit Properties</Typography>
				<form noValidate autoComplete="off">
					<TextField
						id="name"
						name="name"
						value={currentBot.name}
						onChange={handleInputChange}
						label="Name"
					/>
					<TextField
						id="room_url"
						name="room_url"
						value={currentBot.room_url}
						onChange={handleInputChange}
						label="Room url"
					/>
				</form>
				</CardContent>
				<CardActions>
				<Button
					onClick={handleClickOpenUpdateConfirmation}
					color="primary"
					variant="contained"
				>
					Save bot
				</Button>
				<Button
					onClick={handleClickOpenDeleteConfirmation}
					color="secondary"
					variant="contained"
				>
					Delete
				</Button>
				<Button
					onClick={cancelUpdateBot}
					color="default"
					variant="contained"
				>
					Cancel
				</Button>
				</CardActions>
			</Card>
			{/* Confirmation */}
			{updateConfirmationTemplate}
			{deleteConfirmationTemplate}
		</div>
	);

	return (
		<div className="bot-properties">
			{editMode ? editTemplate : displayTemplate}
		</div>
	);
};

export default Properties;