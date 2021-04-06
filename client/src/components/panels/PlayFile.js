import React, { useState, useEffect } from "react";
import BotDataService from "../../services/BotService";

const PlayFile = props => {
	const initialFileState = {
		filename: null
	};
	const [jsonFiles, setJsonFiles] = useState([]);
	const [mp3Files, setMp3Files] = useState([]);

	const [currentJsonFile, setCurrentJsonFile] = useState(initialFileState);
	const [currentMp3File, setCurrentMp3File] = useState(initialFileState);
  
	useEffect(() => {
		getFiles();
	}, []);

	const getFiles = () => {
	  BotDataService.getAssetsList()
		.then(response => {
			setJsonFiles(response.data.files.json);
			setMp3Files(response.data.files.mp3);
			console.log(response.data);
		})
		.catch(e => {
		  	console.log(e);
		});
	};

	const handleJsonInputChange = event => {
		const { name, value } = event.target;
		setCurrentJsonFile({ ...currentJsonFile, [name]: value });
	};

	const handleMp3InputChange = event => {
		const { name, value } = event.target;
		setCurrentMp3File({ ...currentMp3File, [name]: value });
	};

	const playJson = () => {
		var data = {
			filename: currentJsonFile.filename
		};
		BotDataService.playFile(props.bot.uuid, data)
		.then(response => {
			console.log(response.data);
		})
		.catch(e => {
			console.log(e);
		});
	};

	const playMp3 = () => {
		var data = {
			filename: currentMp3File.filename
		};
		BotDataService.playFile(props.bot.uuid, data)
		.then(response => {
			console.log(response.data);
		})
		.catch(e => {
			console.log(e);
		});
	};

	return (
		<div className="card">
			<div className="card-header">
				<h5 className="mb-0">PlayFile</h5>
			</div>
			<div className="card-body">
				<div className="form-group">
					<label for="play_json">Play Json</label>
					<select
						type="text"
						className="form-control"
						id="play_json"
						name="filename"
						value={currentJsonFile.filename}
						onChange={handleJsonInputChange}
					>
						<option>Select a file...</option>
					{jsonFiles &&
						jsonFiles.map((filename) => (
							<option value={filename}>{filename}</option>
					))}
					</select>
					<button className="badge badge-danger mr-2" onClick={playJson}>
						Play Json
					</button>
				</div>

				<div className="form-group">
					<label for="play_mp3">Play Mp3</label>
					<select
						type="text"
						className="form-control"
						id="play_mp3"
						name="filename"
						value={currentMp3File.filename}
						onChange={handleMp3InputChange}
					>
						<option>Select a file...</option>
					{jsonFiles &&
						mp3Files.map((filename) => (
							<option value={filename}>{filename}</option>
					))}
					</select>
					<button className="badge badge-danger mr-2" onClick={playMp3}>
						Play Mp3
					</button>
				</div>
			</div>
		</div>
	);
};

export default PlayFile;