
'use strict';
var Hapi          = require( 'hapi' );
var nodemailer    = require( 'nodemailer' );
var pack          = require( './package' );
var _error        = Hapi.error;

var server   = new Hapi.Server( {
	'debug' : {
		'request' : [ 'error' ]
	}
} );

var PORT = process.env.PORT || 3000;

// set server connection
server.connection( {
	'host' : 'localhost',
	'port' : PORT
} );

var routes = [
	{
		'method'  : 'GET',
		'path'    : '/',
		'handler' : function ( request, reply ) {
			reply( pack.name.toUpperCase() + ' ' + pack.version + '<br><i>' + pack.description + '</i>' );
		}
	},
	{
		'method'  : 'POST',
		'path'    : '/',
		'handler' : function ( request, reply ) {

			var payload     = request.payload;
			var transporter = nodemailer.createTransport();

			payload.message += '<br><br>Cheers,<br><br>' + payload.fullname;

			var mailOptions = {
				from                 : payload.email,
				to                   : 'janderbacalso@gmail.com',
				subject              : payload.subject,
				generateTextFromHTML : true,
				html                 : payload.message
			};

			// send mail with defined transport object
			transporter.sendMail( mailOptions, function ( error, response ) {
				if ( error ) {
					console.log( error );
					reply( error );
				} else {
					console.log( 'Message sent from: ' + payload.fullname + ' <' + payload.email + '>' );
					reply( 'Message sent successfully!' );
				}

				transporter.close();
			} );
		}
	}
];

var start = function ( err ) {
	if ( err ) {
		return _error.badRequest( 'Unable to start server.' );
	}

	console.log( 'Server started at : ' + server.info.uri );
};

server.route( routes );

server.start( start );
