if (/^\/[^\/]+\/manager\/[^\/]+\/highlight\/?$/.test(window.location.pathname))
	RunHighlighter.highlight();

var rhOverlay = $("div .overlay-background.run-highlighter, div .overlay-div.run-highlighter");
if (window.location.search.indexOf("?run-highlighter") === 0)
	rhOverlay.show();
$(".overlay-close").click(function() {
	rhOverlay.hide();
});

var attempts = [];
var runsCombobox = $('#run-history select[name="run"]');
var errorMessage = $("#run-highlighter-error-message");
var searching = false;

var setErrMsg = function(msg, color) {
	errorMessage.text(msg);
	if (color) errorMessage.css("color", color);
};

runsCombobox.change(function(){
	if (RunHighlighter._xhr && RunHighlighter._xhr.readyState !== XMLHttpRequest.DONE) {
		console.log("Run Highlighter: search aborted");
		RunHighlighter._xhr.abort();
	}
	searching = false;
	setErrMsg("");
});

document.getElementById("splits").addEventListener("change", function(event) {
	attempts = [];
	runsCombobox.empty();
	setErrMsg("");
	$('#run-history').hide();
	if (event.target.files.length <= 0)
		return;

	var file = event.target.files[0];
	var fr = new FileReader();
	fr.onloadend = function(event) {
		attempts = RunHighlighter.runsFromXML(event.target.result);
		if (attempts !== null && attempts.length > 0) {
			attempts.forEach(function(run, i) {
				var ago = run.ended.from(moment.utc());
				var precisionStr = "";
				if (run.isStartedSynced === false || run.isEndedSynced === false)
					precisionStr = "(/!\\ imprecise entry)";
				runsCombobox.append("<option>" +
					"Attempt #" + run.id + ": "+ run.rta +" RTA, " + ago + " " + precisionStr
					+ "</option>");
			});
			$('#run-history').show();
		} else
			setErrMsg("No runs found in this file.", "red");
		console.log("Run Highlighter: found " + (attempts !== null ? attempts.length : 0) + " runs in \"" + file.name + "\"");
	}
	fr.readAsText(file);
}, false);

$("a#search-vod").click(function() {
	if (searching) {
		console.log("Run Highligher: already searching");
		return;
	}
	searching = true;
	setErrMsg("Searching...", "black");
	var run = attempts[runsCombobox[0].selectedIndex];
	var channel = window.location.pathname.split("/")[1];
	try {
		console.log("Run Highlighter: started searching for video...");
		RunHighlighter.searchRun(channel, run, function(link){
			if (link) {
				setErrMsg('Found it!', "black");
				var currentUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
				if (link.split('?')[0] === currentUrl) {
					window.history.replaceState({}, document.getElementsByTagName("title")[0].innerHTML, link);
					RunHighlighter.highlight();
					rhOverlay.hide();
				} else {
					console.log("Run Highlighter: navigating to the highlighter page");
					window.location.href = link;
				}
			} else {
				setErrMsg("No video matched in this channel.", "red");
			}
		});
	} catch (e) {
		console.error("Run Highlighter: "+ e);
		setErrMsg("Error.", red);
		searching = false;
	}
});
