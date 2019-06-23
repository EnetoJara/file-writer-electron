"use strict";

const path = require("path");
const marked = require("marked");
const { remote, ipcRenderer, } = require("electron");

const mainProcess = remote.require("./main");
const currentWindow = remote.getCurrentWindow();
var filePath = null;
var originalContent = "";

const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdownButton = document.querySelector("#save-markdown");
const revertButton = document.querySelector("#revert");
const saveHtmlButton = document.querySelector("#save-html");
const showFileButton = document.querySelector("#show-file");
const openInDefaultButton = document.querySelector("#open-in-default");

const removeStyles = () => {
	markdownView.classList.remove("drag-over");
	markdownView.classList.remove("drag-error");
};

/**
 * adds whatever content param has into the htmlView
 * @param {markdown} param markdown text
 */
const renderMardownToHtml = (param) => {
	htmlView.innerHTML = marked(param, { sanitize: true, });
};

/**
 * sets the title of the current window according to the name of the file
 */
const updateUserInterface = (isEdited) => {
	let title = "Neto's Company SA de CV";
	if (filePath) {
		title = isEdited
			? `${ title } - ${ path.basename(filePath) } *`
			: `${ title } - ${ path.basename(filePath) }`;
	}
	currentWindow.setTitle(title);
	currentWindow.setDocumentEdited(isEdited);

	saveMarkdownButton.disabled = !isEdited;
	revertButton.disabled = !isEdited;
};

const getDraggedFile = (evt) => evt.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];
const fileTypeIsSupported = (file) =>
	["text/plain", "text/markdown", "text/html", "text/javascript"].includes(
		file.type
	);

const renderFile = (file, content) => {
	filePath = file;
	originalContent = content;

	markdownView.value = content;
	renderMardownToHtml(content);

	updateUserInterface(false);
};

markdownView.addEventListener("keyup", (evt) => {
	const { value, } = evt.target;
	renderMardownToHtml(value);
	updateUserInterface(value !== originalContent);
});

openFileButton.addEventListener("click", () => {
	mainProcess.getFileFromUser(currentWindow);
});

ipcRenderer.on("file-opened", (event, file, content) => {
	if (currentWindow.isDocumentEdited()) {
		const result = remote.dialog.showMessageBox(currentWindow, {
			type: "warning",
			title: "Overwrite Current Unsaved Changes?",
			message:
				"Opening a new file in this window will overwrite your unsaved changes. Open this file anyway?",
			buttons: ["Yes", "Cancel"],
			defaultId: 0,
			cancelId: 1,
		});

		if (result === 1) return;
	}

	renderFile(file, content);
});

ipcRenderer.on("file-changed", (event, file, content) => {
	const result = remote.dialog.showMessageBox(currentWindow, {
		type: "warning",
		title: "Overwrite Current Unsaved Changes?",
		message: "Another application has changed this file. Load changes?",
		buttons: ["Yes", "Cancel"],
		defaultId: 0,
		cancelId: 1,
	});

	if (result === 1) return;

	renderFile(file, content);
});

newFileButton.addEventListener("click", () => mainProcess.main());

saveHtmlButton.addEventListener("click", () =>
	mainProcess.saveHtml(currentWindow, htmlView.innerHTML)
);

saveMarkdownButton.addEventListener("click", () =>
	mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value)
);

revertButton.addEventListener("click", () => {
	markdownView.value = originalContent;
	renderMardownToHtml(originalContent);
});

document.addEventListener("dragstart", (event) => event.preventDefault());
document.addEventListener("dragover", (event) => event.preventDefault());
document.addEventListener("dragleave", (event) => event.preventDefault());
document.addEventListener("drop", (event) => event.preventDefault());

markdownView.addEventListener("dragover", (evt) => {
	const file = getDraggedFile(evt);
	if (fileTypeIsSupported(file)) {
		markdownView.classList.add("drag-over");
	} else {
		markdownView.classList.add("drag-error");
	}
});

markdownView.addEventListener("dragleave", () => {
	removeStyles();
});

markdownView.addEventListener("drop", (evt) => {
	const file = getDroppedFile(evt);
	if (!fileTypeIsSupported(file)) {
		alert("this nigka!");
		return;
	}

	mainProcess.openFile(currentWindow, file.path);
	removeStyles();
});
