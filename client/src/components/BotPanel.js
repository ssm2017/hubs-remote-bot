import React from "react";
import { Link } from "react-router-dom";
import PlayFile from "./PlayFile";
import JumpTo from "./JumpTo";

const BotPanel = props => {
	return (
		<div className="card">
			<div className="card-body">
				<h5 className="card-title">{props.bot.name}</h5>
				<dl>
					<dt>Uuid</dt>
						<dd>{props.bot.uuid}</dd>
					<dt>Name</dt>
						<dd>{props.bot.name}</dd>
					<dt>Room Url</dt>
						<dd>{props.bot.room_url}</dd>
				</dl>
				<Link
					to={"/bots/" + props.bot.uuid}
					className="card-link badge badge-warning"
					>
					Edit
				</Link>
				<PlayFile bot={props.bot}/>
				<JumpTo bot={props.bot}/>
			</div>
		</div>
	);
};

export default BotPanel;