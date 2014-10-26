var Device = require('./lib/device'),
	util = require('util'),
	stream = require('stream'),
	configHandlers = require('./lib/config-handlers');

// Give our driver a stream interface
util.inherits(localWebHookDriver,stream);

// Our greeting to the user.
var HELLO_NINJA_ANNOUNCEMENT = {
	'contents': [
		{ 'type': 'heading', 'text': 'Local Webhooks' },
		{ 'type': 'paragraph', 'text': 'Webhooks for LAN.' }
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
function localWebHookDriver(opts, app) {

	var self = this;

	self._app = app;
	self._opts = opts;
	self._opts.localWebhooks = opts.localWebhooks || [];

	// self._localWebhooks = {};

	app.on('client::up',function(){
		// The client is now connected to the Ninja Platform

		// Check if we have sent an announcement before. If not, send one and save the fact that we have.
		if (!opts.hasSentAnnouncement) {
			self.emit('announcement', HELLO_NINJA_ANNOUNCEMENT);
			opts.hasSentAnnouncement = true;
			self.save();
		}

		console.log('Client is connected to Ninja Platform', self.opts);
	});
}

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
localWebHookDriver.prototype.config = function(rpc, cb) {
	console.log('function config(rpc, cb)', rpc, cb);

	var self = this;

	//If rpc is null, we should send the user a menu of what he/she can do. Otherwise, we will try action the rpc method
	if (!rpc) {
		return cb(null, {'contents':[ {'type': 'submit' , 'name': 'Add local Webhook', 'rpc_method': 'addNew' } ]});
	}

	switch(rpc.method) {
		case 'addNew':
			cb(null, {
				'contents': [
					{ 'type': 'paragraph', 'text': 'Please enter a unique Identifier for your local Webhook (no whitespace) and your local URL'},
					{ 'type': 'input_field_text', 'field_name': 'name_key', 'value': '', 'label': 'Name', 'placeholder': 'Name for local Webhook', 'required': true},
					{ 'type': 'input_field_text', 'field_name': 'ip_key', 'value': '', 'label': 'IP Address', 'placeholder': 'IP key', 'required': true},
					{ 'type': 'submit', 'name': 'Add local Webhook', 'rpc_method': 'add'}
				]
			});
			break;

		case 'add':
			console.log('IP key: ' + rpc.params.ip_key);
			console.log('Name key: ' + rpc.params.name_key);

			if (self.addLocalWebhook(rpc.params.name_key, rpc.params.ip_key)){
				cb(null, {
					'contents': [
						{'type': 'paragraph', 'text': 'Your local IP has been saved.'},
						{'type': 'close', 'text': 'Close'}
					]
				});
			} else {
				cb(null, {
					'contents': [
						{ 'type': 'paragraph', 'text': 'IP did not save. Please try again.'},
						{ 'type': 'submit', 'name': 'Add local Webhook', 'rpc_method': 'addNew'}
					]
				});
			}
			break;

		default:
			console.log('--- Error ----');
			console.error('Error unknown rpc method');
	}
};

localWebHookDriver.prototype.addLocalWebhook = function(name_key, ip_key) {
	console.log('function addLocalWebhook(name_key, ip_key)', name_key, ip_key);

	var self = this;

	console.log('Check if local webhook exist...');

	// self._opts.localWebhooks = self.opts.localwebhooks || [];

	for (var id in self._opts.localWebhooks){
		if (id === name_key){
			console.log('Exists with id: ' + id + ' === ' + name_key);
			return false;
		} else {
			console.log(id + ' != ' + name_key);
		}
	}

	var localWebhookOptions = {
		name: name_key,
		ip: ip_key
	};

	self._opts.localWebhooks[name_key] = localWebhookOptions; //add to options

	self.save();

	var localWebhookDevice = new Device(localWebhookOptions, self);

	console.log('Register new device ...');

	this.emit('register', localWebhookDevice);

	console.log('New Device registered.');

	return true;
};

// Export it
module.exports = localWebHookDriver;