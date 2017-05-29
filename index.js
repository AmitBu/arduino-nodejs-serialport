const robot = require("robotjs");
const SerialPort = require("serialport");

const MOVE_DELTA = 10;

// Serial port messages for actions
const ACTION = {
	scrollUp: '1',
	scrollDown: '2',
	moveY: 'y:',
	moveX: 'x:'
}

/**
 * Returns the port the contains arduino
 * @param callback - function - returns the port
 */
function getArduinoPort(callback) {
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
	var Readline = SerialPort.parsers.Readline;

	var parser = port.pipe(Readline({ delimiter: '\n' }));

	var counter = 0;

	port.on('open', function () {
		port.write('main screen turn on', function (err) {
			if (err) {
				return console.log('Error on write: ', err.message);
			}
			console.log('message written');
		});

		parser.on('data', function (data) {
			//let code = String.fromCharCode.apply(null, data);
			console.log(data);
			//console.log(++counter, data, "\n__");

			switch (data) {
				case ACTION.scrollUp:
					moveUp();
					break;
				case ACTION.scrollDown:
					moveDown();
					break;
			}
			// Moving actions
			if (data.includes(ACTION.moveX)) {
				moveX(parseMoveValue(data));
			}
			if (data.includes(ACTION.moveY)) {
				moveY(parseMoveValue(data));
			}
		});
	});
}

/**
 * Takes the value of X / Y postition received, and returns an int
 * @param {string} value 
 * @return {number}
 */
function parseMoveValue(value) {
	let parsed = value.replace(ACTION.moveX, "").replace(ACTION.moveY, "");
	parsed = parseInt(parsed) || 0;
	// TODO: Validations for number length
	return parsed;
}

/**
 * Move cursor on the Y axis
 * @param {number} value 
 * @param {number} multiplier 
 */
function moveY(value, multiplier = MOVE_DELTA) {
	let { x, y } = robot.getMousePos();

	// Minus added for value - plus needs to be top & minus bottom
	robot.moveMouse(x, y + (-value * MOVE_DELTA));
}

/**
 * Move cursor on the X axis
 * @param {number} value 
 * @param {number} multiplier 
 */
function moveX(value, multiplier = MOVE_DELTA) {
	let { x, y } = robot.getMousePos();

	robot.moveMouse(x + (value * MOVE_DELTA), y);
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