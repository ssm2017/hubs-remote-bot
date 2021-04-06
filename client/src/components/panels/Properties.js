import React from "react";
import { Link } from "react-router-dom";

const Properties = props => {
	return (
		<div className="card">
			<div className="card-header">
				<h5 className="mb-0">Properties</h5>
			</div>
			<div className="card-body">
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
			</div>
		</div>
	);
};

export default Properties;