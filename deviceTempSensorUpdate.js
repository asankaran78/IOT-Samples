
var Protocol = require('azure-iot-device-http').Http;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

var Cylon = require('cylon');

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"

var connectionString = //  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"

// fromConnectionString must specify a transport constructor, coming from any transport package.
var client = Client.fromConnectionString(connectionString, Protocol);

var connectCallback = function (err) {
  if (err) {
    console.log('Could not connect to Azure IoT Hub');
    console.error(err);
    process.exit(1);
  }
  
  Cylon.robot({
    connections: {
      edison: { adapter: 'intel-iot' }
    },

    devices: {
      environment: { driver: 'analog-sensor', pin: 0 }
    },

    work: function(device) {
      var sensorVal,
        celsius,
		resistance,
        data;

      every((1).second(), function() {
        sensorVal = device.environment.analogRead(),
          resistance = (1023-sensorVal)*10000/sensorVal; 
		  celsius = 1/(Math.log(resistance/10000)/3975+1/298.15)-273.15;
        data = {
          voltage: sensorVal,
          celsius: celsius,
          fahrenheit: celsius * (9.0 / 5.0) + 32.0,
          time: new Date().toISOString()
        };

        var dataString = JSON.stringify({ deviceId: deviceId, temperature: data.fahrenheit, time: data.time });
        console.log('Sending data to IoT Hub', dataString);
        client.sendEvent(new Message(dataString), function onSendMessageFail(err) {
          if (err) {
            console.log('Error sending data to IoT Hub', err.toString());
          }
        });
      })
    }
  }).start();
 }
  
  client.open(connectCallback);
 