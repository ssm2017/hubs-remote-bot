import React, { useState, useEffect } from "react";
import BotDataService from "../../services/BotService";

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
	formControl: {
	  margin: theme.spacing(1),
	  minWidth: 120,
	},
	selectEmpty: {
	  marginTop: theme.spacing(2),
	},
  }));

const JumpTo = props => {
	const classes = useStyles();
	const initialWaypointsListState = {
		waypoint: null
	};
	const [waypointsList, setWaypointsList] = useState([]);

	const [currentWaypoint, setCurrentWaypoint] = useState(initialWaypointsListState);
  
	useEffect(() => {
		getWaypoints();
	}, []);

	const getWaypoints = () => {
	  BotDataService.getWaypointsList(props.bot.uuid)
		.then(response => {
			setWaypointsList(response.data);
			console.log(response.data);
		})
		.catch(e => {
		  	console.log(e);
		});
	};

	const handleWaypointChange = event => {
		const { name, value } = event.target;
		setCurrentWaypoint({ ...currentWaypoint, [name]: value });
	};

	const jumpTo = () => {
		var data = {
			waypoint: currentWaypoint.waypoint
		};
		BotDataService.jumpTo(props.bot.uuid, data)
		.then(response => {
			console.log(response.data);
		})
		.catch(e => {
			console.log(e);
		});
	};

	const noWaypointAvailable = (
		<Alert  elevation={6} variant="filled" severity="info">No waypoint available in this room.</Alert>
	);

	const waypointsAvailable = (
		<FormControl variant="outlined" className={classes.formControl}>
			<InputLabel htmlFor="waypoints">Select a waypoint</InputLabel>
			<NativeSelect
				value={currentWaypoint.name || ''}
				onChange={handleWaypointChange}
				inputProps={{
					name: 	'waypoint',
					id: 	'waypoints',
					type:	"text"
				}}
				>
					<option key={0} aria-label="None" value=""></option>
					{waypointsList &&
						waypointsList.map((waypoint, index) => (
						<option key={index +1} value={waypoint.name}>{waypoint.name}</option>
					))}
			</NativeSelect>
			{currentWaypoint.name ?
			<Button 
				onClick={jumpTo}
				variant="contained"
			>
				Jump To
			</Button>
			: "" }
		</FormControl>
	);

	return (
		<Card>
			<CardContent>
				<Typography variant="h5" component="h2">Jump to</Typography>
				{waypointsList.length ? waypointsAvailable : noWaypointAvailable}
			</CardContent>
		</Card>
	);
};

export default JumpTo;