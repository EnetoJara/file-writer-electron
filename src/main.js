"use strict";

const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, dialog, } = require("electron");
const logger = require("./logger");
const windows = new Set();
const openFiles = new Map();

/**
 * @description gets the content of any given file passed as parameter
 * @param {Window} target instance of an electron window
 * @param {String} file path of where the file at
 * @access private
 * @returns file content
 */
function openFile (target, file) {
	logger.entryMethod("openFile");
	return fs.readFile(file, (err, data) => {
		if (err) throw err;
		app.addRecentDocument(file);
		target.setRepresentedFilename(file);
		target.webContents.send("file-opened", file, data.toString());
		logger.leaveMethod("openFile");
	});
}

/**
 * @description Opens the file dialog
 * @param {Window} target instance of an electron window
 * @access public
 * @returns void
 */
function getFileFromUser (target) {
	logger.entryMethod("getFileFromUser");
	const files = dialog.showOpenDialog(target, {
		properties: ["openFile"],
		filters: [
			{
				name: "Code Files",
				extensions: ["js", "ts", "css", "scss", "html", "sql"],
			},
			{ name: "Text Files", extensions: ["txt", "doc", "docx"], },
			{ name: "Markdown Files", extensions: ["md", "markdown"], }
		],
	});

	if (files) return openFile(target, files[0]);
	logger.leaveMethod("getFileFromUser");
}

function saveHtml (target, content) {
	logger.entryMethod("saveHtml");
	const file = dialog.showSaveDialog(target, {
		title: "Save HTML",
		defaultPath: app.getPath("documents"),
		filters: [{ name: "HTML Files", extensions: ["html", "htm"], }],
	});
	if (!file) return;
	return fs.writeFile(file, content, (err) => {
		if (err) throw err;
		logger.leaveMethod("saveHtml");
		return true;
	});
}

function saveMarkdown (target, file, content) {
	logger.entryMethod("saveMarkdown");
	logger.debugger(file);
	if (!file) {
		file = dialog.showSaveDialog(target, {
			title: "Save Markdown",
			defaultPath: app.getPath("documents"),
			filters: [
				{ name: "Markdown Files", extensions: ["md", "markdown"], }
			],
		});
		if (!file) return;
		return fs.writeFile(file, content, (err) => {
			if (err) throw err;
			logger.leaveMethod("saveMarkdown");
		});
	}
}

function stopWatchingFile (target) {
	logger.entryMethod("stopWatching");
	if (openFiles.has(target)) {
		openFiles.get(target).stop();
		openFiles.delete(target);
	}
	logger.leaveMethod("stopWatchingFile");
}

function startWatchingFile (target, file) {
	logger.entryMethod("startWatchingFile");
	stopWatchingFile(target);
	const watcher = fs.watchFile(file, (event) => {
		if (event === "change") {
			const content = fs.readdirSync(file);
			target.webContents.send("file-changed", file, content);
		}
	});
	logger.leaveMethod("startWatchingFile");
	openFiles.set(target, watcher);
}

/**
 * @description Creates a new instance of a window
 * @access public
 * @method
 * @constructor
 * @returns {Electron} window
 */
function main () {
	logger.entryMethod("main");
	var currentWindow = null;
	var focusing = BrowserWindow.getFocusedWindow();
	var x;
	var y;

	if (focusing) {
		const [currentWindowX, currentWindowY] = focusing.getPosition();
		x = currentWindowX + 10;
		y = currentWindowY + 10;
	}

	currentWindow = new BrowserWindow({
		x,
		y,
		webPreferences: {
			nodeIntegration: true,
		},
		width: 1024,
		height: 800,
		show: false,
	});

	currentWindow.loadFile(path.join(__dirname, "index.html"));

	currentWindow.on("ready-to-show", () => {
		currentWindow.show();
		currentWindow.webContents.openDevTools();
	});

	currentWindow.on("close", (event) => {
		if (currentWindow.isDocumentEdited()) {
			event.preventDefault();
			const result = dialog.showMessageBox(currentWindow, {
				type: "warning",
				title: "Quit with unsaved changes?",
				message:
					"Your changes wont be apply maw nigka, would you like to save them ?",
				buttons: ["fuck'em", "wait a minute, then"],
				defaultId: 0,
				cancelId: 1,
			});

			if (result === 0) return currentWindow.destroy();
		}
	});

	currentWindow.on("closed", () => {
		windows.delete(currentWindow);
		stopWatchingFile(currentWindow);
		currentWindow = null;
	});

	windows.add(currentWindow);

	logger.leaveMethod("main");
	return currentWindow;
}

app.on("ready", main);
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
app.on("activate", (_, hasVisibleWindows) => !hasVisibleWindows && main());
app.on("will-finish-launching", () => {
	app.on("open-file", (_, file) => {
		const win = main();
		win.once("ready-to-show", () => {
			startWatchingFile(win, file);
			openFile(win, file);
		});
	});
});

module.exports = {
	main,
	getFileFromUser,
	saveHtml,
	saveMarkdown,
};
