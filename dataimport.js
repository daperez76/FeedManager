
'use strict';

var async     = require('async');
var fs        = require('fs');
var path      = require('path');
var config    = require('./config/index');
var watcher   = require('./lib/watcher');
var analytics = require('./lib/analytics');
var mailer    = require('./lib/mailer');
var emailSuccess=true;

function dataImport(file,cfg,callback) {
  console.info('Request dataImport for file: %s ...',file);
  analytics.dataImport(file,cfg, function(err,result) {
    callback(err,result);
  });
}

function mail(file,uploadedData, callback) {
  var message='<b>Moonshine le informa la actualización del catalogo ha sido ';
  var status=uploadedData.status;
  console.info(uploadedData);
  switch (status){
    case 'FAILED':
      message+='incorrecta.<br>Adjunto a este correo le adjuntamos el fichero para que lo revise.</b><br>'+uploadedData.errors;
      return mailError(message,file,callback);
    case 'COMPLETED':
      message+='correcta.</b>';
      return mailSuccess(message,callback);
  }
}

function mailSuccess(message,callback) {
  console.info('Sending success email...');
  mailer.sendMail(message, function(err,result){
      callback(err,result);
  });
}

function mailError(message,file, callback) {
  console.info('Sending error email...');
  mailer.sendMultipartMail(message,file,function(err,result){
    callback(err,result);
  });
}

function checkMailStatus(result,callback){
  console.info("Checking mail result... ");
  if (result.rejected.length===0)
    console.info("Everyone has been notified from data-import result.");
  else{
    console.info("The following users couldn´t have recived the data-import result.")
    for(var i=0;i<result.rejected.length;i++)
      console.info(result.rejected[i]);
  }
  callback(null);
}

function deleteFile(file, callback) {
  console.info('Deleting file %s ...',file);
  var fileName=path.basename(file);
  fs.unlink(file, function(err){
    if (err)
      callback(err);
    else
      callback(null, 'File deleted, process end.');
  })

}

function processFile(file,callback){
  var cfg=config.getConfig(file);
  if (cfg!==null)
    callback(null,cfg);
  else {
    var message="El fichero "+ file+" no es un fichero valido para procesar.Posibles valores: supermercado.csv , supermecadopt.csv o hipercor.csv";
    callback(message);
  }
}

function checkValidFile(file,callback){
  var stack = [
    processFile.bind(null,file),
    dataImport.bind(null,file),
    mail.bind(null,file),
    checkMailStatus,
    deleteFile.bind(null,file)
  ];
  async.waterfall(stack, callback);
}

function notificarError(message,file, callback){
  var stack  = [
    mailError.bind(null,message,file),
    checkMailStatus,
    deleteFile.bind(null,file)
  ];
  async.waterfall(stack, callback);
}

watcher.monitor(config.folder, function(evt, file) {
  console.info("Monitor started");
  switch (evt) {//Comprueba el evento
    case 'add':
      console.info('File %s added',file);
      checkValidFile(file,function(err,result){
        if (err) {
          console.error("Se ha producido un error: "+err);
          notificarError(err,file, function(errMail, result){
            if (errMail)
              console.info("Error grave, no se ha podido notificar. "+err+". Proceso finalizado.");
            else
              console.info("Notificacion del error enviada correctamente. Proceso finalizado");
          })
        }else
          console.info(result);
      });
      break;
    case 'remove':
      console.log('File %s was removed!', file);
      break;
  }
});
