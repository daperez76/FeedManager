var chokidar = require('chokidar');
var format    = require('util').format;

var opts = {
  ignored: /[\/\\]\./,
  persistent: true
}

module.exports = {
  monitor: function(folder, listener){
    console.log(format("Monitoring %s",folder));
    var watcher = chokidar.watch(folder, opts);
    //Se hace el bind del primer parametro del callbak para poder identificar el evento, chokidar no lo devuelve.
    watcher.on('add', listener.bind(undefined, 'add'));
    watcher.on('unlink', listener.bind(undefined, 'remove'))
  }
}
