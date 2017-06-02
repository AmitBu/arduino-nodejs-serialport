const robot = require("robotjs");
const SerialPort = require("serialport");

const MOVE_DELTA = 10;
const SCROLL_PIXELS = 20; // The amount of pixels per scroll
const DEFAULT_SCROLL = 1; // The scroll default speed multiplier
const SCROLL_SPEED_DELTA = 0.3;

// Serial port messages for actions
const ACTION = {
	scrollUp: '1',
	scrollDown: '2',
	moveY: 'y:',
	moveX: 'x:'
}
const UP = 'up';
const DOWN = 'down';

let scrollSpeed = {
	[UP]: DEFAULT_SCROLL,
	[DOWN]: DEFAULT_SCROLL
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

	let lastUp = null;
	let lastDown = null;

	port.on('open', function () {
		// Listen to serial port messages from arduino
		parser.on('data', function (data) {
			// Scroll actions
			if (data === ACTION.scrollUp) {
				checkScrollSpeed(UP, new Date() - lastUp);
				lastUp = new Date();
				moveUp();
			}
			if (data === ACTION.scrollDown) {
				checkScrollSpeed(DOWN, new Date() - lastDown);
				lastDown = new Date();
				moveDown();
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
 * Checks the diff between last presses, updates scrolling speed accordingly
 * @param {string} position - 'up' / 'down'
 * @param {number} dateDiff - Milliseconds between last press
 */
function checkScrollSpeed(position, dateDiff) {
	if (dateDiff < 200) { // TODO: Constant
		scrollSpeed[position] += SCROLL_SPEED_DELTA;
		console.log(scrollSpeed[position]);
	}
	else {
		scrollSpeed[position] = DEFAULT_SCROLL;
	}
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
	robot.scrollMouse(0, SCROLL_PIXELS * scrollSpeed[UP]);
}

/**
 * Scroll the mouse down
 */
function moveDown() {
	console.log("Scroll down");
	robot.scrollMouse(0, -SCROLL_PIXELS * scrollSpeed[DOWN]);
}

function init() {
	getArduinoPort(handlePortData);
}

init();