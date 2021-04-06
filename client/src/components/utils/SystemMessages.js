import React, {useState, useEffect} from 'react';

const SystemMessages = props => {
	const [levelState, setLevelState] = useState([]);
	
	useEffect(() => {
		switch (props.level) {
			case 100:
				setLevelState("info");
				break;
			case 200:
				setLevelState("success");
				break;
			case 304:
				setLevelState("warning");
				break;
			case 400:
			case 404:
			case 500:
				setLevelState("danger");
				break;
			default:
				setLevelState(props.level);
	
		}
	}, [props])
	return (
		<div className="system-messages">
			<div className={`alert alert-${levelState}`} role="alert">{props.message}</div>
		</div>
	);
}
export default SystemMessages;