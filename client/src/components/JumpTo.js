import React, { useState, useEffect } from "react";
import BotDataService from "../services/BotService";

const JumpTo = props => {
	const initialWaypointsListState = {
		waypoint: null
	};
	const [waypointsList, setWaypointsList] = useState([]);

	const [currentWaypoint, setCurrentWaypoint] = useState(initialWaypointsListState);
  
	useEffect(() => {
		getWaypoints();
	});

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

	return (
		<div className="edit-form">
        	<h4>JumpTo</h4>

			<div class="form-group">
				<label for="waypoints">Waypoints</label>
				<select
					type="text"
					className="form-control"
					id="waypoints"
					name="waypoint"
					value={currentWaypoint.name}
					onChange={handleWaypointChange}
              	>
					<option>Select a waypoint...</option>
				{waypointsList &&
            		waypointsList.map((waypoint) => (
						<option value={waypoint.name}>{waypoint.name}</option>
				))}
				</select>
				<button className="badge badge-danger mr-2" onClick={jumpTo}>
					JumpTo
				</button>
			</div>

		</div>
	);
};

export default JumpTo;