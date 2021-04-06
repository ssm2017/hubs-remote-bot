import React, {useState} from 'react';

import Properties from "./panels/Properties";
import PlayFile from "./panels/PlayFile";
import JumpTo from "./panels/JumpTo";
import GoTo from "./panels/GoTo";

const BotPanel = props => {
	const [showPanel, setShowPanel] = useState([]);
	return (
		<div className="botpanel">
			<nav className="navbar fixed-top navbar-expand navbar-dark bg-dark">
				<a href="/bots" className="navbar-brand">
				bezKoder
				</a>
				<div className="navbar-nav mr-auto">
					<li className="nav-item" onClick={() => setShowPanel("properties")}>
						<button>Prop</button>
					</li>
					<li className="nav-item" onClick={() => setShowPanel("playfile")}>
						<button>PF</button>
					</li>
					<li className="nav-item" onClick={() => setShowPanel("jumpto")}>
						<button>JT</button>
					</li>
					<li className="nav-item" onClick={() => setShowPanel("goto")}>
						<button>GT</button>
					</li>
				</div>
			</nav>
			<div className="container">
				{showPanel === "properties" && <Properties bot={props.bot}/>}
				{showPanel === "playfile" && <PlayFile bot={props.bot}/>}
				{showPanel === "jumpto" && <JumpTo bot={props.bot}/>}
				{showPanel === "goto" && <GoTo bot={props.bot}/>}
			</div>
		</div>
	);
};

export default BotPanel;