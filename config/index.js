var path       = require('path');

function loadConfig(file){
  console.log("Loading configuration...");
  var fileName=path.basename(file,'.csv');
  var store=fileName.substring(0,fileName.length-4);

  if (fileName === null){
    console.error("Could not find config for file %s",file);
    return null;
  }

  var accountId;
  var propertyId;
  var dataSourceId;

  switch (fileName) {
    case 'supermercado':
        accountId= '42384899';
        propertyId= 'UA-42384899-10';
        dataSourceId= 'GdHycdsfQ164sUpoZKSBVA';
      break;
    case 'supermercadopt':
      accountId= '42384899';
      propertyId= 'UA-42384899-16';
      dataSourceId= 'QJu_0jTzTdq2822fGRMY';
      break;
    case 'hipercor':
      accountId= '42384899';
      propertyId= 'UA-42384899-11';
      dataSourceId= '3fxWTORrS1unmg_RYWq3Lw';
      break;
    default:
      console.error("Could not find config for file %s",file);
      return null;
  }
  var cfg={
    'store':store[1],
    'accountId':accountId,
    'propertyId':propertyId,
    'dataSourceId':dataSourceId
  }
  console.log("Configuration loaded.");
  return cfg;
}

module.exports = {
  folder : './files',
	getConfig : function (file){
    return loadConfig(file);
  }

};
