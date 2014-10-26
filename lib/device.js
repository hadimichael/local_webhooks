var LocalWebhook = require('node-localwebhooks'),
	stream = require('stream'),
	util = require('util');

// Give our device a stream interface
util.inherits(Device, stream);

/**
 * Creates a new Device Object
 *
 * @property {Boolean} readable Whether the device emits data
 * @property {Boolean} writable Whether the data can be actuated
 *
 * @property {Number} G - the channel of this device
 * @property {Number} V - the vendor ID of this device
 * @property {Number} D - the device ID of this device
 *
 * @property {Function} write Called when data is received from the Ninja Platform
 *
 * @fires data - Emit this when you wish to send data to the Ninja Platform
 */
function Device(localWebhookOptions, mainDevice) {
	console.log("function Device(localWebhookOptions, mainDevice)", localWebhookOptions, mainDevice);

	var self = this;

	this._name = localWebhookOptions.name;
	this._ip = localWebhookOptions.ip;
	this._mainDevice = mainDevice;

	this.readable = true; // This device will emit data
	this.writeable = true; // This device can be actuated

	this.G = "localWebhooks" + this._name.replace(/[^a-zA-Z0-9]/g, ''); // G is a string a represents the channel
	this.V = 0; // 0 is Ninja Blocks' device list
	this.D = 240; // 2000 is a generic Ninja Blocks sandbox device

	this.name = "LocalWebhook: " + this._name;

	process.nextTick(function() {
		// self.emit('data','Hello World');
	});
}

/**
 * Called whenever there is data from the Ninja Platform
 * This is required if Device.writable = true
 *
 * @param  {String} data The data received
 */
Device.prototype.write = function(data) {
	var self = this;

	console.log("Device.write");

	console.log("Sending local Request");
	console.log("Name: " + this._name);
	console.log("IP: " + this._ip);

	var localRequest = new LocalWebhook({
		ip: this._ip
	});

	localRequest.post(data);

	return true;
};

// Export it
module.exports = Device;
