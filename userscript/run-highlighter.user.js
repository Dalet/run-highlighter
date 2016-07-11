// ==UserScript==
// @id			run-highlighter
// @name		Run Highlighter
// @namespace	https://dalet.github.io/run-highlighter/
// @author		Dalet https://github.com/Dalet
// @description	Finds your runs in your past broadcasts on Twitch
// @homepage	https://dalet.github.io/run-highlighter/
// @icon		https://dalet.github.io/run-highlighter/favicon.gif

// @version		1.0
// @downloadURL	https://raw.githubusercontent.com/Dalet/run-highlighter/master/userscript/run-highlighter.user.js

// @match		*://www.twitch.tv/*
// @match		*://twitch.tv/*
// @match		*://dalet.github.io/run-highlighter/*

// @grant		none
// @run-at		document-end
// ==/UserScript==

(function() {
	if (document.body.hasAttribute("run-highlighter-addon"))
		return;
	var s = document.createElement('script');
	s.src = "https://dalet.github.io/run-highlighter/js/injected.js";
	s.async = true;
	s.onload = function() { this.parentNode.removeChild(this); };
	document.head.appendChild(s);
})();
