import React from "react";
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const Properties = props => {
	return (
		<div className="bot-properties">
		<Card>
          <CardContent>
		  <Typography variant="h5" component="h2">Properties</Typography>
		  <dl>
				<dt>Uuid</dt>
					<dd>{props.bot.uuid}</dd>
				<dt>Name</dt>
					<dd>{props.bot.name}</dd>
				<dt>Room Url</dt>
					<dd>{props.bot.room_url}</dd>
			</dl>
		  </CardContent>
		  <CardActions>
		  <Button
					href={`/bots/${props.bot.uuid}`}
					variant="outlined"
					color="primary"
					>
					Edit
				</Button>
		  </CardActions>
		</Card>
		</div>
	);
};

export default Properties;