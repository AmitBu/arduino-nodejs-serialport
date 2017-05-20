var robot = require("robotjs");
var SerialPort = require("serialport");

// Serial port messages for actions
const UP_ACTION = '1';
const DOWN_ACTION = '2';

/**
 * Returns the port the contains arduino
 * @param callback - function - returns the port
 */
function getArduinoPort(callback){
	SerialPort.list((err, ports) => {
		let port = ports.find(p => p.manufacturer && p.manufacturer.includes('Arduino'));

		callback(new SerialPort(port.comName));
	})
}

/**
 * Event handlers for port communication
 * @param {SerialPort} port 
 */
function handlePortData(port) {
	port.on('open', function () {
		port.write('main screen turn on', function (err) {
			if (err) {
				return console.log('Error on write: ', err.message);
			}
			console.log('message written');
		});

		port.on('data', function (data) {
			if (data == UP_ACTION) {
				moveUp();
			}
			else if (data == DOWN_ACTION) {
				moveDown();
			}
		});
	});
}

/**
 * Scroll the mouse up
 */
function moveUp() {
	console.log("Scroll up");
	robot.scrollMouse(0, 20);
}

/**
 * Scroll the mouse down
 */
function moveDown() {
	console.log("Scroll down");
	robot.scrollMouse(0, -20);
}

function init() {
	getArduinoPort(handlePortData);
}

init();