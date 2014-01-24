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
  
  self._opts.localwebhooks = opts.localwebhooks;
  
  self._localwebhooks = {};

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
    //self.emit('register', new Device(self._opts.ip_key));
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
		"type": "submit" , "name": "Add local Webhook - v 0.1"
		, "rpc_method": "addNew"
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
  	case 'addNew':
	  cb(null, {
		  "contents": [
	  			{ "type": "paragraph", "text": "Please enter ta unique Identifier for your local Webhook (no whitespace, etc.) and your local URL"}
				, { "ype": "input_field_text", "field_name": "name_key", "value": "", "label": "Name key", "placeholder": "Name fpr local Webhook", "required": true}
				, { "type": "input_field_text", "field_name": "ip_key", "value": "", "label": "IP key", "placeholder": "IP key", "required": true}
				, { "type": "submit", "name": "Add local Webhook", "rpc_method": "add"}
			]
	  });
	  break;
	case 'add':
		console.log("IP key: " + rpc.params.ip_key);
		console.log("Name key: " + rpc.params.name_key);
		if(self.addLocalWebhook(rpc.params.name_key, rpc.params.ip_key){
			cb(null, {
	  		  "contents": [
	  	  			{ "type": "paragraph", "text": "Your local IP has been saved."}
	  				, {"type": "close", "text": "Close"}
	  			]
			});
		} else {
			cb(null, {
	  		  "contents": [
	  	  			{ "type": "paragraph", "text": "Return to Add New."}
	  				, { "type": "submit", "name": "Add local Webhook", "rpc_method": "addNew"}
	  			]
			});
		}		
		break;
	default:
		console.log("--- Error ----");
		console.log('Error unknown rpc method');
  }
};

myDriver.prototype.addLocalWebhook = function(name_key, ip_key){
	console.log("function addLocalWebhook");
	console.log("name_key:" + name_key);
	console.log("ip_key"": " + ip_key);
	
	consloe.log("Check if local webhook exist...");
	for(var id in self._opts.localWebhookOptions){
		if(id.name == name_key){
			console.log(id.name + " == " + name_key);
			return false;
		} else {
			console.log(id.name + " != " + name_key);
		}
	}
	
	var localWebhookOptions = {
		"name": name_key
		, "ip": ip_key
	};
	
	self._opts.localwebhooks[name_key] = localWebhooksOptions;
	self.save();
	
	var localWebhookDevice = new Device(localWebhookOptions, self);
	
	//this._opts.ip_key = ip_key;
	//this.save();
	console.log("Register new device ...");
	this.emit('register', new Device(name_key, ip_key));
	console.log("New Device registered.");
	return true;
}


// Export it
module.exports = myDriver;