import React, { useState } from "react";
import BotDataService from "../../services/BotService";
import SystemMessages from "../utils/SystemMessages";

const GoTo = props => {
	const initialPositionState = {
		position: {
			x: null,
			y: null,
			z: null
		}
	};
	const [currentPosition, setCurrentPosition] = useState(initialPositionState);

	const handlePositionChange = event => {
		const { name, value } = event.target;
		setCurrentPosition(currentPosition => ({
			...currentPosition,
			position: {
			  ...currentPosition.position,
			  [name]: value
			}
		  }));
	};

	const initialSystemMessage = {
		message: null,
		status: 0
	};
	const [currentSystemMessage, setCurrentSystemMessage] = useState(initialSystemMessage);

	const goTo = () => {
		var data = {
			x: currentPosition.position.x,
			y: currentPosition.position.y,
			z: currentPosition.position.z
		};
		BotDataService.goTo(props.bot.uuid, data)
		.then(response => {
			setCurrentSystemMessage(response.data);
			console.log("response",response.data);
		})
		.catch(e => {
			setCurrentSystemMessage(e.response.data.error);
			console.log("error response",e.response);
		});
	};

	return (
		<div className="card">
			<div className="card-header">
				<h5 className="mb-0">goTo</h5>
			</div>
			<div className="card-body">
				<div class="messages">
					<SystemMessages level={currentSystemMessage.status} message={currentSystemMessage.message} />
				</div>
				<div className="form-group">
					<label for="position_x">Position x</label>
					<input
					type="number"
					className="form-control"
					id="position_x"
					required
					value={currentPosition.position.x}
					onChange={handlePositionChange}
					name="x"
					/>
					<label for="position_y">Position y</label>
					<input
					type="number"
					className="form-control"
					id="position_y"
					required
					value={currentPosition.position.y}
					onChange={handlePositionChange}
					name="y"
					/>
					<label for="position_z">Position z</label>
					<input
					type="text"
					className="form-control"
					id="position_z"
					required
					value={currentPosition.position.z}
					onChange={handlePositionChange}
					name="z"
					/>
					<button className="badge badge-danger mr-2" onClick={goTo}>
						GoTo
					</button>
				</div>
			</div>
		</div>
	);
};

export default GoTo;