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
function Device(localWebhookOptions, mainDevice) {
	console.log("function Device(name, ip, mainDevice)");
	console.log("name: " + localWebhookOptions.name);
	console.log("ip: " + localWebhookOptions.ip);
	
  var self = this;

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;
  
  this._name = localWebhookOptions.name;
  this._ip = localWebhookOptions.ip;
  this._mainDevice = mainDevice;
  
  

  this.G = "localWebhooks" + this.name.replace(/[^a-zA-Z0-9]/g, ''); // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 240; // 2000 is a generic Ninja Blocks sandbox device
  
  this.name = "LocalWebhook " + this._name;

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
	var self = this;
	var main = this._main;
	
	console.log("Device.write");
	
	
	console.log("Sending local Request");
	console.log("Name: " + this)
	console.log("IP: " + this._ip)
	var localRequest = new LocalWebhook({
		ip: this._ip
	});
	localRequest.send(function(cbData){
		console.log("data: " + data);
		this.emit('data', data);
	});
	
	//this.emit('data', 'Local Request Done');
	//console.log("data: " + data);
	return true;
};
