var stream = require('stream')
  , util = require('util')
  , LocalWebhook = require('node-localwebhooks');

// Give our device a stream interface
util.inherits(Device,stream);

// Export it
module.exports=Device;

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
function Device(ip) {
	console.log("function Device(ip)");
	console.log("New Device added.");
  var self = this;

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;
  
  this._ip = ip;

  this.G = "localWebhooks"; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 240; // 2000 is a generic Ninja Blocks sandbox device
  
  this.name = "LocalWebhooks";

  process.nextTick(function() {

    //self.emit('data','Hello World');
  });
};

/**
 * Called whenever there is data from the Ninja Platform
 * This is required if Device.writable = true
 *
 * @param  {String} data The data received
 */
Device.prototype.write = function(data) {
	console.log("Device.write");
	
	this.emit('data', data);
	console.log("data: " + data);
	
	console.log("Sending local Request");
	console.log("IP: " + this._ip)
	var localRequest = new LocalWebhook({
		ip: this._ip
	});
	localRequest.send(data);
	return true;
};
