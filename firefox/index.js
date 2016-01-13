var pageMod = require("sdk/page-mod"),
	data = require('sdk/self').data,
	localFiles = {
		'lib/browser.api.js': data.url('lib/browser.api.js'),
		'lib/waitForKeyElements.js': data.url('lib/waitForKeyElements.js'),
		'lib/moment.js': data.url('lib/moment.js'),
		'run-highlighter-obj.js': data.url('run-highlighter-obj.js'),
		'run-highlighter.js': data.url('run-highlighter.js'),
		'run-highlighter.html': data.url('run-highlighter.html')
	};

var localFilesContent = {};
Object.keys(localFiles).forEach(function(file) {
	localFilesContent[file] = data.load(localFiles[file]);
});

pageMod.PageMod(
{
	include: "*.twitch.tv",
	contentScriptFile: [
		data.url("lib/jquery-2.2.0.min.js"),
		data.url("lib/browser.api.js"),
		data.url("lib/waitForKeyElements.js"),
		data.url("inject.js")
	],
	contentStyleFile: data.url("run-highlighter.css"),
	contentScriptOptions: {
		paths: localFiles,
		filesContent: localFilesContent
	},
	contentScriptWhen: "ready"
});
