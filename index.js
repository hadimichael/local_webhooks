var Device = require('./lib/device')
  , util = require('util')
  , stream = require('stream')
  , configHandlers = require('./lib/config-handlers');

// Give our driver a stream interface
util.inherits(myDriver,stream);

// Our greeting to the user.
var HELLO_WORLD_ANNOUNCEMENT = {
  "contents": [
    { "type": "heading",      "text": "Local Webhhoks" },
    { "type": "paragraph",    "text": "Just Webhooks (requests) for LAN." }
  ]
};

/**
 * Called when our client starts up
 * @constructor
 *
 * @param  {Object} opts Saved/default driver configuration
 * @param  {Object} app  The app event emitter
 * @param  {String} app.id The client serial number
 *
 * @property  {Function} save When called will save the contents of `opts`
 * @property  {Function} config Will be called when config data is received from the Ninja Platform
 *
 * @fires register - Emit this when you wish to register a device (see Device)
 * @fires config - Emit this when you wish to send config data back to the Ninja Platform
 */
function myDriver(opts,app) {

  var self = this;
  
  self._app = app;
  self._opts = opts;

  app.on('client::up',function(){

    // The client is now connected to the Ninja Platform

    // Check if we have sent an announcement before.
    // If not, send one and save the fact that we have.
    if (!opts.hasSentAnnouncement) {
      self.emit('announcement',HELLO_WORLD_ANNOUNCEMENT);
      opts.hasSentAnnouncement = true;
      self.save();
    }

    // Register a device
    self.emit('register', new Device(self._opts.ip_key));
  	console.log(self._opts);
  });
};

/**
 * Called when a user prompts a configuration.
 * If `rpc` is null, the user is asking for a menu of actions
 * This menu should have rpc_methods attached to them
 *
 * @param  {Object}   rpc     RPC Object
 * @param  {String}   rpc.method The method from the last payload
 * @param  {Object}   rpc.params Any input data the user provided
 * @param  {Function} cb      Used to match up requests.
 */
myDriver.prototype.config = function(rpc,cb) {

  var self = this;
  // If rpc is null, we should send the user a menu of what he/she
  // can do.
  // Otherwise, we will try action the rpc method
  if (!rpc) {
    //return configHandlers.menu.call(this,cb);
	return cb(null, {"contents":[
	{
		"type": "submit"
		, "name": "Add local IP - v 0.0.2"
		, "rpc_method": "addIP"
	}
	]});
  }
  /*
  else if (typeof configHandlers[rpc.method] === "function") {
    return configHandlers[rpc.method].call(this,rpc.params,cb);
  }
  else {
    return cb(true);
  }
  */
  
  switch(rpc.method) {
  	case 'addIP':
	  cb(null, {
		  "contents": [
	  			{ "type": "paragraph", "text": "Please enter your local IP"}
				, { "type": "input_field_text", "field_name": "ip_key", "value": "", "label": "IP key", "placeholder": "IP key", "required": true}
				, {"type": "submit", "name": "Add", "rpc_method": "addIPKeys"}
			]
	  });
	  break;
	case 'addIPKeys':
		console.log("IP key: " + rpc.params.ip_key);
		self.addKeys(rpc.params.ip_key);
		cb(null, {
  		  "contents": [
  	  			{ "type": "paragraph", "text": "Your local IP has been saved."}
  				, {"type": "close", "text": "Close"}
  			]
		});
	default:
		console.log("--- Error ----");
		console.log('Error unknown rpc method');
  }
};

myDriver.prototype.addKeys = function(ip_key){
	console.log("function addKeys: " + ip_key);
	this._opts.ip_key = ip_key;
	this.save();
	this.emit('register', new Device(ip_key));
}


// Export it
module.exports = myDriver;