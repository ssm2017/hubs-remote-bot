// osc
var osc = require("osc");

/**
 * =====================
 *  Start osc server
 * =====================
 *
 */
var getIPAddresses = function () {
  var os = require("os"),
    interfaces = os.networkInterfaces(),
    ipAddresses = [];
  for (var deviceName in interfaces) {
    var addresses = interfaces[deviceName];
    for (var i = 0; i < addresses.length; i++) {
      var addressInfo = addresses[i];
      if (addressInfo.family === "IPv4" && !addressInfo.internal) {
        ipAddresses.push(addressInfo.address);
      }
    }
  }
  return ipAddresses;
};

var OSCserver = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: config.osc_port,
});

OSCserver.on("ready", function () {
  var ipAddresses = getIPAddresses();
  console.log("Listening for OSC over UDP.");
  ipAddresses.forEach(function (address) {
    console.log(" Host:", address + ", Port:", OSCserver.options.localPort);
  });
});

// -----------
// osc
// -----------
OSCserver.on("message", function (oscMessage) {
  console.log(oscMessage);
});

OSCserver.open();
