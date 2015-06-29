var nodemailer = require('nodemailer');
var async      = require('async');
var path       = require('path');
var config     = {
	mail        : {
		from      : 'Marketing Tecnológico marketingtecnologico@noreplay.com',
		to        : '"Analitica Web" analiticaweb@elcorteingles.es',
		cc        : '"Laura Rodriguez" <laura_rodriguez@elcorteingles.es>',
		bcc       : '"Daniel" daniel.perez.bermudez@atsistemas.com',
		subjectOk : 'Actualización de catalogo correcta',
		subjectNOk: 'Actualización de catalogo incorrecta',
	},
	auth        :{
		user      : 'ecidataimport@gmail.com',
		password  : '@5|cT6X\'Bd;Fo"~Z7S\\K'
	}
};


function createTransport(callback){
	console.log("Login on mail server...");
	var transporter =nodemailer.createTransport({
		service:'gmail',
		auth   : {
			user :config.auth.user,
			pass :config.auth.password
		}
	});

	callback(null,transporter);
}

function sendSimpleMail(message,transporter,callback){
	console.log("Sending mail ...");
	var mailOptions = {
	    from   : "Marketing Tecnológico "+config.mail.from,
	    //to   : config.mail.to,
	    //cc   : config.mail.cc,
	    bcc    : config.mail.bcc,
	    subject: config.mail.subjectOk,
	    html   : message // html body
	};

	transporter.sendMail(mailOptions, callback);
}

function sendMultipartMail(message,file,transporter,callback){
	console.log(file);
	console.log("Sending mail ...");
	var mailOptions = {
	    from : "Marketing Tecnológico "+config.mail.from,
	    //to : config.mail.to,
	    //cc : config.mail.cc,
	    bcc : config.mail.bcc,
	    subject : config.mail.subjectNOk,
	    html : message, // html body
	    attachments : [
        {
            filename: path.basename(file),
            content : file
        }]
	};
	try {
		transporter.sendMail(mailOptions, callback);
	} catch(err){
		console.log(err.stack);
	}

}

module.exports    = {
	sendMail: function(message,callback){
		var stack = [];
		stack.push(createTransport);
		stack.push(sendSimpleMail.bind(undefined,message));
		async.waterfall(stack,callback);
	},
	sendMultipartMail: function(message,filePath,callback){
		var stack = [];
		stack.push(createTransport);
		stack.push(sendMultipartMail.bind(undefined,message,filePath));
		async.waterfall(stack,callback);
	}
}
