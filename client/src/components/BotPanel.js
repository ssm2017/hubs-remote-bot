import React, {useState, useEffect} from 'react';
import Properties from './panels/Properties';
import PlayFile from './panels/PlayFile';
import JumpTo from './panels/JumpTo';
import GoTo from './panels/GoTo';

import {
	Checkbox,
	Drawer,
	Hidden,
	FormControl,
	FormLabel,
	FormGroup,
	RadioGroup,
	FormControlLabel,
	Radio,
	Switch,
	makeStyles,
	Grid
} from '@material-ui/core';

const TOOLS_DRAWER_WIDTH = 200;

const useStyles = makeStyles((theme) => ({
	fab: {
		margin: 0,
		top: 'auto',
		right: 20,
		bottom: 20,
		left: 'auto',
		position: 'fixed'
	},
	root: {
		display: 'flex',
	},
	drawer: {
		[theme.breakpoints.up('sm')]: {
			width: TOOLS_DRAWER_WIDTH,
			flexShrink: 0,
		},
	},
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
	},
	menuButton: {
		marginRight: theme.spacing(2),
		[theme.breakpoints.up('sm')]: {
			display: 'none',
		},
	},
	// necessary for content to be below app bar
	toolbar: theme.mixins.toolbar,
		drawerPaper: {
		width: TOOLS_DRAWER_WIDTH,
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3),
	},
	title: {
		flexGrow: 1,
	},
	toolsPanel: {
		marginTop: "100px",
		padding: "10px"
	}
  }));

const panelsList = [
	{
		command: "properties",
		title: "Properties"
	},
	{
		command: "play_file",
		title: "Play file"
	},
	{
		command: "jump_to",
		title: "Jump to"
	},
	{
		command: "go_to",
		title: "Go to"
	}
];

const DefaultToolsDisplayList = [
	"properties", "jump_to"
];

const BotPanel = props => {
	// tools menu
	const [showMobileTools, setShowMobileTools] = useState(props.showToolsMenu);
	useEffect(() => {
		setShowMobileTools(props.showToolsMenu);
	}, [props.showToolsMenu]);
	
	const handleToolsDrawerToggle = () => {
		setShowMobileTools(!showMobileTools);
		props.onToggleTools(!showMobileTools);

	};

	const [toolsDisplayList, setToolsDisplayList] = useState(DefaultToolsDisplayList);

	const handleToolsDisplayListChange = (event) => {
		if (soloMode) {
			setToolsDisplayList([event.target.name]);
		} else {
			// remove if exist
			const idx = toolsDisplayList.indexOf(event.target.name);
			if (idx > -1) {
				let newArray = toolsDisplayList.filter(function(ele){ 
					return ele !== event.target.name; 
				});
				setToolsDisplayList(newArray);
			} else {
				// add a new one
				setToolsDisplayList([...toolsDisplayList, event.target.name]);
			}
		}
	}

	const classes = useStyles();
	const [soloMode, setSoloMode] = useState(false);
	const handleSetSoloMode = (event) => {
		setSoloMode(event.target.checked);
	  };

	const toolsPanel = (
		<div className={classes.toolsPanel}>
			<FormControlLabel
				control={
					<Switch
						checked={soloMode}
						onChange={handleSetSoloMode}
						name="solo_mode"
						color="primary"
					/>
				}
				label="Solo mode"
			/>
			{soloMode ? (
				<FormControl component="fieldset">
					<FormLabel component="legend">Tools</FormLabel>
					<RadioGroup aria-label="gender" name="gender1" value="aaa" onChange={(event) => handleToolsDisplayListChange(event)}>
						{panelsList.map((panel, index) => (
							<FormControlLabel
								key={index}
								value={panel.command}
								control={
									<Radio
									key={index}
									checked={toolsDisplayList.includes(panel.command)}
									name={panel.command}
									/>
								}
								label={panel.title}
							/>
						))}
					</RadioGroup>
				</FormControl>
			) : (
			<FormControl component="fieldset" className={classes.formControl}>
				<FormLabel component="legend">Assign responsibility</FormLabel>
				<FormGroup onChange={(event) => handleToolsDisplayListChange(event)}>
				{panelsList.map((panel, index) => (
					<FormControlLabel
						control={
							<Checkbox
								key={index}
								checked={toolsDisplayList.includes(panel.command)}
								name={panel.command}
							/>
						}
						label={panel.title}
						key={index}
					/>
				))}
				</FormGroup>
			</FormControl>
			)}
		</div>
	);

	const mobileMenuTemplate = (
		<Drawer
			// container={container}
			variant="temporary"
			anchor='right'
			open={showMobileTools}
			onClose={handleToolsDrawerToggle}
			classes={{
				paper: classes.drawerPaper,
			}}
			ModalProps={{
				keepMounted: true, // Better open performance on mobile.
			}}
			>
			{toolsPanel}
		</Drawer>
	);

	const desktopMenuTemplate = (
		<div>
		<Drawer
			classes={{
				paper: classes.drawerPaper,
			}}
			variant="permanent"
			open
			anchor='right'
			>
			{toolsPanel}
		</Drawer>
	</div>
	);

	return (
		<div className="botpanel">
		<nav className={classes.drawer}>
			{/* The implementation can be swapped with js to avoid SEO duplication of links. */}
			<Hidden smUp implementation="css">
			{mobileMenuTemplate}
			</Hidden>
			
			<Hidden xsDown implementation="css">
			{desktopMenuTemplate}
			</Hidden>
		</nav>

			<div className="container">
				<Grid container spacing={3}>
					<Grid item xs>
						{toolsDisplayList.includes("properties") && <Properties bot={props.bot}/>}
					</Grid>
					<Grid item xs>
						{toolsDisplayList.includes("play_file") && <PlayFile bot={props.bot}/>}
					</Grid>
					<Grid item xs>
						{toolsDisplayList.includes("jump_to") && <JumpTo bot={props.bot}/>}
					</Grid>
					<Grid item xs>
						{toolsDisplayList.includes("go_to") && <GoTo bot={props.bot}/>}
					</Grid>
				</Grid>
			</div>
		</div>
	);
};

export default BotPanel;