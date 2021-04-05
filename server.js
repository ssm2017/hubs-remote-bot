// get config
require('dotenv').config();

// http
const express = require('express');
const httpServer = express();
const bodyParser = require('body-parser');
// const { response } = require('express');
const HTTP_PORT = process.env.HTTP_PORT || 7000
httpServer.listen(HTTP_PORT, function() {
	console.log('Http server started on port %s', HTTP_PORT);
});
//httpServer.use(express.static('public'));
httpServer.use(express.static('client/build'));

httpServer.use(bodyParser.urlencoded({ extended: true }));
httpServer.use(bodyParser.json());
httpServer.use(bodyParser.raw());

const routes = require('./src/routes');
routes(httpServer);

// redirect 404
// source : https://stackoverflow.com/questions/6528876/how-to-redirect-404-errors-to-a-page-in-expressjs
httpServer.use(function(req, res, next) {
	res.status(404);

	// respond with html page
	// if (req.accepts('html')) {
	// 	res.render('404', { url: req.url });
	// 	return;
	// }

	// respond with json
	if (req.accepts('json')) {
		res.json({
			success: false,
			message: "Not found."
		});
		return;
	}

	// default to plain-text. send()
	res.type('txt').send('Not found');
});