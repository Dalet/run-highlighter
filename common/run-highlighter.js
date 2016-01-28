(function() {
	$('.run-highlighter.overlay-div .tab-links a').on('click', function(e) {
		var currentAttrValue = $(this).attr('href');

		// Show/Hide Tabs
		$('.run-highlighter.overlay-div ' + currentAttrValue).show().siblings().hide();
		// Change/remove current tab to active
		$(this).parent('li').addClass('active').siblings().removeClass('active');

		cancelSearch();
		setMsg(errorMessage, "");

		if (segmentTabLoaded === false && $(this).attr("href") === "#tab2") {
			loadSegmentTab();
		}

		e.preventDefault();
	});

	if (/^\/[^\/]+\/manager\/[^\/]+\/highlight\/?$/.test(window.location.pathname))
		RunHighlighter.highlight();

	var rhOverlay = $("div .overlay-background.run-highlighter, div .overlay-div.run-highlighter");
	if (window.location.search.indexOf("?run-highlighter") === 0)
		rhOverlay.show();
	$(".overlay-close").click(function() {
		rhOverlay.hide();
	});

	var attempts = [];
	var segments = [];
	var segmentAttempts = null;
	var runsCombobox = $('.run-highlighter select[name="run"]');
	var segmentsNameCb = $('.run-highlighter select[name="segmentName"]');
	var segmentsIdCb = $('.run-highlighter select[name="segmentId"]');
	var errorMessage = $("#run-highlighter-error-message");
	var runInfo = $("#run-highlighter-run-info");
	var segInfo = $("#run-highlighter-segment-info");
	var searching = false;
	var segmentTabLoaded = false;

	var setMsg = function(elem, msg, color) {
		elem.text(msg);
		if (color) elem.css("color", color);
	};

	var getSelectedRun = function(what) {
		if (what === "run"
			|| (what === undefined && $('.run-highlighter.overlay-div ul li:eq(0)').hasClass("active")))
			return attempts[runsCombobox[0].selectedIndex];
		else if (what === "segment"
			|| (what === undefined && $('.run-highlighter.overlay-div ul li:eq(1)').hasClass("active")))
			return segmentAttempts[segmentsIdCb[0].selectedIndex];
	};

	var loadSegmentTab = function() {
		segmentTabLoaded = true;
		var fragment = document.createDocumentFragment();
		//add segment names to the combobox
		if (segments.length > 0) {
			var x = 0;
			segments.forEach(function(seg, i) {
				x++;
				var option = document.createElement("option");
				option.textContent = x + ": \"" + seg.name + "\"";
				fragment.appendChild(option);
			});
			segmentsNameCb.append(fragment);
			segmentsNameCb.show();
			segmentsNameCb.trigger('change');
		} else {
			segmentsNameCb.hide();
			setMsg(segInfo, "No segments.", "black");
		}
	};

	cancelSearch = function() {
		if (RunHighlighter._xhr && RunHighlighter._xhr.readyState !== XMLHttpRequest.UNSENT &&
			RunHighlighter._xhr.readyState !== XMLHttpRequest.DONE) {
				console.log("Run Highlighter: search aborted");
				RunHighlighter._xhr.abort();
			}
			searching = false;
	};

	runsCombobox.change(function(){
		cancelSearch();
		setMsg(errorMessage, "");
		setMsg(runInfo, "");
		var run = getSelectedRun("run");
		if (run !== null) {
			if (run.isStartedSynced === false || run.isEndedSynced === false) {
				setMsg(runInfo, "This run might not be found precisely.", "red");
			}
		}
	});

	segmentsNameCb.change(function() {
		cancelSearch();
		setMsg(errorMessage, "");
		setMsg(segInfo, "");

		var selectedSegment = segments[segmentsNameCb[0].selectedIndex];
		segHistory = selectedSegment.getHistory(20);
		segmentAttempts = [];
		segmentsIdCb.empty();

		if (segHistory.length === 0){
			segmentsIdCb.hide();
			setMsg(segInfo, "No highlightable segment was found.", "black");
		} else {
			var fragment = document.createDocumentFragment();
			segHistory.forEach(function(seg, i) {
				var run = seg.ToRun();
				segmentAttempts.push(run);
				var time = selectedSegment.useIgt ? seg.igt : seg.rta;
				var timeStr = RunHighlighter._format_time(time.asSeconds(), 2) + " " + (selectedSegment.useIgt ? "IGT" : "RTA");
				var warningStr = "";
				if (seg.attempt.isStartedSynced === false || seg.attempt.isEndedSynced === false)
					warningStr = " /!\\";
				var ago = run.ended.from(moment.utc());

				var option = document.createElement("option");
				option.textContent =  "#" + seg.attempt.id + (seg.isPb ? " (PB)" : "") + " : " + timeStr + (seg.isBest ? " (Best)" : "")
					+ ", " + ago + warningStr;
				fragment.appendChild(option);
			});
			segmentsIdCb.append(fragment);
			segmentsIdCb.show();
			segmentsIdCb.trigger("change");
		}
	});

	segmentsIdCb.change(function() {
		cancelSearch();
		setMsg(errorMessage, "");
		setMsg(segInfo, "");
		var run = getSelectedRun("segment");
		if (run !== null) {
			if (run.isStartedSynced === false || run.isEndedSynced === false) {
				setMsg(segInfo, "This segment might not be found precisely.", "red");
			}
		}
	});

	document.getElementById("splits").addEventListener("change", function(event) {
		attempts = [];
		segments = [];
		segmentsNameCb.empty();
		segmentsIdCb.empty();
		runsCombobox.empty();
		setMsg(errorMessage, "");
		$('.run-highlighter.overlay-div .tab-content, .run-highlighter.overlay-div .tab-links, a#search-vod').hide();
		$('.run-highlighter.overlay-div .tab-links a:eq(0)').trigger('click');

		if (event.target.files.length <= 0) {
			return;
		}

		var file = event.target.files[0];
		var fr = new FileReader();
		fr.onloadend = function(event) {
			attempts = Run.ArrayFromXML(event.target.result);
			segments = Segment.ArrayFromXML(event.target.result);
			setMsg(errorMessage, "");
			setMsg(runInfo, "");
			setMsg(segInfo, "");
			segmentTabLoaded = false;

			if (attempts === null || segments === null) {
				setMsg(errorMessage, "Invalid file", "red");
				return;
			}

			if (attempts.length === 0) {
				setMsg(runInfo, "No highlightable run was found.", "black");
				runsCombobox.hide();
			} else {
				//add complete runs to the combobox
				var fragment = document.createDocumentFragment()
				attempts.forEach(function(run, i) {
					var ago = run.ended.from(moment.utc());
					var warningStr = "";
					if (run.isStartedSynced === false || run.isEndedSynced === false)
					warningStr = " /!\\";
					var useIgt = run.igt !== null;
					var time = useIgt ? run.igt : run.rta;
					var timeStr = RunHighlighter._format_time(time.asSeconds()) + " " + (useIgt ? "IGT" : "RTA");

					var option = document.createElement("option");
					option.textContent = "#" + run.id + ": "+ timeStr + ", " + ago + warningStr;
					fragment.appendChild(option);
				});
				runsCombobox.append(fragment);
				runsCombobox.show();
			}

			$('.run-highlighter.overlay-div .tab-content, .run-highlighter.overlay-div .tab-links, a#search-vod').show();
			console.log("Run Highlighter: found " + (attempts !== null ? attempts.length : 0) + " runs in \"" + file.name + "\"");
		};
		fr.readAsText(file);
	}, false);

	$("a#search-vod").click(function() {
		if (searching) {
			console.log("Run Highligher: already searching");
			return;
		}
		searching = true;
		setMsg(errorMessage, "Searching...", "black");

		var run = getSelectedRun();
		console.log("RunHighlighter: Selected run:");
		console.log(run);

		var channel = window.location.pathname.split("/")[1];
		try {
			console.log("Run Highlighter: started searching for video...");
			RunHighlighter.searchRun(channel, run, function(link){
				if (link) {
					setMsg(errorMessage, 'Found it!', "black");
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
					setMsg(errorMessage, "No video matched in this channel.", "red");
				}
			});
		} catch (e) {
			console.error("Run Highlighter: "+ e);
			setMsg(errorMessage, "Error.", red);
			searching = false;
		}
	});
})();
