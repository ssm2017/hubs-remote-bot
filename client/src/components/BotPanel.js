import React, {useState} from 'react';
import Properties from './panels/Properties';
import PlayFile from './panels/PlayFile';
import JumpTo from './panels/JumpTo';
import GoTo from './panels/GoTo';

import {
	AppBar,
	CssBaseline,
	Divider,
	Drawer,
	Hidden,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Toolbar,
	Typography,
	makeStyles,
	useTheme,
	Button,
	ButtonGroup
} from '@material-ui/core';
  
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const ITEM_HEIGHT = 48;

const BotPanel = props => {
	const [showPanel, setShowPanel] = useState([]);

	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
		console.log("handle click from menu in botpanel", event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const selectTool = (panelName) => {
		handleClose();
		setShowPanel(panelName);
	}

	const toolBar = (
		<div className="toolBar">
			<Hidden xsDown implementation="css">
				<ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
					<Button disabled={showPanel === "properties"} onClick={() => setShowPanel("properties")}>Properties</Button>
					<Button onClick={() => setShowPanel("playfile")}>Play File</Button>
					<Button onClick={() => setShowPanel("jumpto")}>Jump To</Button>
					<Button onClick={() => setShowPanel("goto")}>Go To</Button>
				</ButtonGroup>
			</Hidden>
			
			<Hidden smUp implementation="css">
			<IconButton
					aria-label="more"
					aria-controls="tools-menu"
					aria-haspopup="true"
					onClick={handleClick}
				>
					<MoreVertIcon />
				</IconButton>
				<Menu
					id="tools-menu"
					anchorEl={anchorEl}
					keepMounted
					open={open}
					onClose={handleClose}
					PaperProps={{
					style: {
						maxHeight: ITEM_HEIGHT * 4.5,
						width: '20ch',
					},
					}}
				>
					<MenuItem key={0} onClick={() => selectTool("properties")}>
						Properties
					</MenuItem>
					<MenuItem key={1} onClick={() => selectTool("playfile")}>
						Play File
					</MenuItem>
					<MenuItem key={2} onClick={() => selectTool("jumpto")}>
						Jump To
					</MenuItem>
					<MenuItem key={3} onClick={() => selectTool("goto")}>
						Go To
					</MenuItem>
				</Menu>
			</Hidden>
		</div>
	);

	return (
		<div className="botpanel">
			{toolBar}
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