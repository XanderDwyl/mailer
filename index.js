
'use strict';
var Hapi          = require( 'hapi' );
var nodemailer    = require( 'nodemailer' );
var pack          = require( './package' );

var server   = new Hapi.Server( {
	'debug' : {
		'request' : [ 'error' ]
	}
} );

var PORT = process.env.PORT || 3000;

// set server connection
if ( process.env.PORT ) {
	server.connection( {
		'port' : PORT
	} );
} else {
	server.connection( {
		'host' : 'localhost',
		'port' : PORT
	} );
}

var routes = [
	{
		'method'  : 'GET',
		'path'    : '/',
		'handler' : function ( request, reply ) {
			reply( pack.name.toUpperCase() + ' ' + pack.version + '<br><i>' + pack.description + ' ' + pack.dependencies.nodemailer.replace( '^', '' ) + '</i>' );
		}
	},
	{
		'method'  : 'POST',
		'path'    : '/{recipient}',
		'handler' : function ( request, reply ) {

			var payload     = request.payload;
			var transporter = nodemailer.createTransport();

			payload.message += '<br><br>Cheers,<br><br>' + payload.fullname;

			var mailOptions = {
				from                 : payload.email,
				to                   : request.params.recipient,
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

var _error = Hapi.error;
var start = function ( err, reply ) {
	if ( err ) {
		return _error.badRequest( 'Unable to start server.' + err );
	}

	console.log( 'Server listening on port ' + server.info.uri );
};

server.route( routes );

server.start( start );
