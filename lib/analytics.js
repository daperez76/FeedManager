var async      = require('async');var googleapis = require('googleapis');
var format     = require('util').format;
JWT            = googleapis.auth.JWT,
analytics      = googleapis.analytics('v3');

var SERVICE_ACCOUNT_EMAIL    = '1068815456755-2mj5game8kqb88hljmsmt8cdqftgsqbk@developer.gserviceaccount.com';var SERVICE_ACCOUNT_KEY_FILE = './config/certificate.pem';

var scopeRead                = "https://www.googleapis.com/auth/analytics.readonly"var scopeAnalytics           = "https://www.googleapis.com/auth/analytics"
var authClient               = new JWT(
    SERVICE_ACCOUNT_EMAIL,
    SERVICE_ACCOUNT_KEY_FILE,
    null,
    [scopeRead,scopeAnalytics]

);
function authorize(callback) {  console.log('Authorizing...');
  authClient.authorize(function(err) {
    if (err===null)
      console.log("Authorized.");
    callback(err, authClient);
  });
}

function uploadFile(config,file, authClient, callback) {
  var fileContents = require('fs').readFileSync(file); //Lee el fichero  var options  = {};

  options.auth = authClient;
  console.log('Uploading file %s ...',file);  options.accountId          = config.accountId;  options.webPropertyId      = config.propertyId;
  options.customDataSourceId = config.dataSourceId;
  options.media              = {
    mimeType:"application/octet-stream",
    body: fileContents
  };
  analytics.management.uploads.uploadData(options, function(err, result) {    //console.log("err: "+err, "result: "+JSON.stringify(result,undefined,2));    callback(err, result, authClient);
  });

}
function waitForUpload(config, uploadData, authClient, callback) {
  var options                = {};  options.auth               = authClient;
  options.accountId          = config.accountId;  options.webPropertyId      = config.propertyId;
  options.customDataSourceId = config.dataSourceId;

  analytics.management.uploads.list(options, function(err, result) {

    var item = result.items.filter(function(item) {
      return item.id == uploadData.id    })[0];    switch (item.status) {      case 'PENDING':
        return setTimeout(waitForUpload.bind(null, config, uploadData, authClient, callback), 500);
      case 'FAILED':
      case 'COMPLETED':
          console.log('Upload finished.');
          return callback(null,item);
      default:
        console.log('Upload finished with unknown status.');
          callbak(list);
      }
  });
}

function dataImport(file,config,callback){
  var stack = [];
  stack.push(authorize);
  stack.push(uploadFile.bind(null, config, file));
  stack.push(waitForUpload.bind(undefined, config));
  async.waterfall(stack, callback);
}

/**
 * Exports dataImport
 * @type {Function}
 */
module.exports = dataImport;
