// get config
require('dotenv').config();

// http
const express = require('express');
const httpServer = express();
// const { response } = require('express');
const HTTP_PORT = 			process.env.HTTP_PORT || 7000
httpServer.listen(HTTP_PORT, function() {
	console.log('Http server started on port %s', HTTP_PORT);
});
httpServer.use(express.static('public'));

const routes = require('./src/routes');
routes(httpServer);
