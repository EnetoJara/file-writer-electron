const chalk = require("chalk");

const { log, } = console;

const under = (color, text) => chalk.bold.hex(color).underline(text);
const response = (v) => chalk`{bgBlack.bold.hex('#ffffff') ${ v }}`;
class Logger {
	static entryMethod (name) {
		const method = under("#f8b400", "METHOD:");
		const timestamp = under("#f8b400", "TIMESTAMP:");
		const entry = chalk`{bgWhite.bold.hex("#0445a5") YOU ARE GETTING INTO...}`;
		log(entry);
		log(method + " " + response(name));
		log(timestamp + " " + response(new Date().toISOString()));
		log("\n");
	}

	static leaveMethod (name) {
		const method = under("#0445a5", "METHOD:");
		const timestamp = under("#0445a5", "TIMESTAMP:");
		const entry = chalk`{bold.hex("#0445a5") YOU ARE GETTING INTO...}`;

		log(entry);
		log(method + " " + response(name));
		log(timestamp + " " + response(new Date().toISOString()));
		log("\n");
	}

	static debugger (some) {
		const method = under("#0445a5", "PASSED:");
		log(method, some);
	}
}

module.exports = Logger;
