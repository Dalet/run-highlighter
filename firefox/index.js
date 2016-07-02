var pageMod = require("sdk/page-mod");
var data = require('sdk/self').data;

pageMod.PageMod({
	include: [
		/https?:\/\/(www\.)?twitch\.tv\/.*/,
		/https?:\/\/dalet\.github\.io\/run-highlighter(\/.*)?/
	],
	contentScriptFile: data.url("inject.js"),
	contentScriptWhen: "ready"
});
