(function() {
	$('#tab-links a').on('click', function(e) {
		var currentAttrValue = $(this).attr('href');

		// Show/Hide Tabs
		$('#tab-content ' + currentAttrValue).show().siblings().hide();
		// Change/remove current tab to active
		$(this).parent('li').addClass('active').siblings().removeClass('active');

		cancelSearch();
		setErrMsg("");

		if (segmentTabLoaded === false && $(this).attr("href") === "#tab2") {
			loadSegmentTab();
		}

		e.preventDefault();
	});

	var attempts = [];
	var segments = [];
	var segmentAttempts = null;
	var runsCombobox = $('select[name="run"]');
	var segmentsNameCb = $('select[name="segmentName"]');
	var segmentsIdCb = $('select[name="segmentId"]');
	var errorMessage = $("#error-message");
	var runInfo = $("#run-info");
	var segInfo = $("#segment-info");
	var searching = false;
	var segmentTabLoaded = false;

	var setMsg = function(elem, msg, color) {
		elem.text(msg);
		if (color)
			elem.css("color", color);
		else
			elem.css("color", "initial");
	};

	var setErrMsg = function(msg, alert)
	{
		var elem = $("#error-message");
		elem.attr("class", "");

		if (msg === undefined  || msg.trim() === ""
			|| alert === undefined || alert.trim() === "") {
			alert = "";
			elem.hide();
			return;
		}

		elem.html(msg);
		elem.addClass("alert");
		elem.addClass(alert);
		elem.slideDown(100, "swing");
	};

	var getSelectedRun = function(what) {
		if (what === "run"
			|| (what === undefined && $('ul#tab-links li:eq(0)').hasClass("active")))
		{
			if (attempts.length === 0) return null;
			return attempts[runsCombobox[0].selectedIndex];
		}
		else if (what === "segment"
			|| (what === undefined && $('ul#tab-links li:eq(1)').hasClass("active")))
		{
			if (segmentAttempts.length === 0) return null;
			return segmentAttempts[segmentsIdCb[0].selectedIndex];
		}
	};

	var loadSegmentTab = function() {
		segmentTabLoaded = true;
		var fragment = document.createDocumentFragment();
		//add segment names to the combobox
		if (segments.length > 0) {
			var segCount = 0;
			segments.forEach(function(seg, i) {
				segCount++;
				var option = document.createElement("option");
				var name = seg.name.trim();
				option.textContent = segCount + ": " + name;
				if (name == "")
					$(option).attr("data-content", option.textContent + '<span class="text-muted">no name</span>');
				fragment.appendChild(option);
			});
			segmentsNameCb.append(fragment);
			segmentsNameCb.selectpicker("show");
			segmentsNameCb.trigger('change');
		} else {
			segmentsNameCb.selectpicker("hide");
			setMsg(segInfo, "No segments.", "black");
		}
		segmentsNameCb.selectpicker('refresh');
	};

	var cancelSearch = function() {
		if (RunHighlighter._xhr && RunHighlighter._xhr.readyState !== XMLHttpRequest.UNSENT &&
			RunHighlighter._xhr.readyState !== XMLHttpRequest.DONE) {
				console.log("Run Highlighter: search aborted");
				RunHighlighter._xhr.abort();
			}
			searching = false;
	};

	runsCombobox.change(function(){
		cancelSearch();
		setErrMsg("");
		setMsg(runInfo, "");
		var run = getSelectedRun("run");
		if (run !== null) {
			if (run.isStartedSynced === false || run.isEndedSynced === false) {
				setMsg(runInfo, "This run might not be found precisely.");
			}
		}
	});

	segmentsNameCb.change(function() {
		cancelSearch();
		setErrMsg("");
		setMsg(segInfo, "");

		var selectedSegment = segments[segmentsNameCb[0].selectedIndex];
		segHistory = selectedSegment.getHistory(20);
		segmentAttempts = [];
		segmentsIdCb.empty();

		if (segHistory.length === 0){
			segmentsIdCb.selectpicker("hide");
			setMsg(segInfo, "No highlightable segment was found.", "black");
		} else {
			var fragment = document.createDocumentFragment();
			segHistory.forEach(function(seg, i) {
				var run = seg.ToRun();
				if (run === null || run === undefined)
					return;

				var option = document.createElement("option");
				segmentAttempts.push(run);

				var timeStr = RunHighlighter._format_time(seg.rta.asSeconds(), 2) + " RTA";
				if (selectedSegment.useIgt) {
					timeStr = RunHighlighter._format_time(seg.igt.asSeconds(), 2) + " IGT / " + timeStr;
				}

				if (seg.attempt.isStartedSynced === false || seg.attempt.isEndedSynced === false)
				{
					$(option).addClass("bg-warning");
				}

				if (seg.isBest)
					$(option).attr("data-icon", "glyphicon-star");

				option.textContent = timeStr + ", "+ run.ended.from(moment.utc());
				$(option).attr("data-subtext", "#" + seg.attempt.id  + (seg.isPb ? " (PB)" : ""));
				fragment.appendChild(option);
			});
			segmentsIdCb.append(fragment);
			if (segmentsIdCb.children().length === 0) {
				segmentsIdCb.selecpicker("hide");
				setMsg(segInfo, "No highlightable segment was found.", "black");
			} else {
				segmentsIdCb.selectpicker("show");
				segmentsIdCb.trigger("change");
			}
			segmentsIdCb.selectpicker('refresh');
		}
	});

	segmentsIdCb.change(function() {
		cancelSearch();
		setErrMsg("");
		setMsg(segInfo, "");
		var run = getSelectedRun("segment");
		if (run !== null) {
			if (run.isStartedSynced === false || run.isEndedSynced === false) {
				setMsg(segInfo, "This segment might not be found precisely.");
			}
		}
	});

	$("input#splits").change(function(event) {
		attempts = [];
		segments = [];
		segmentsNameCb.empty();
		segmentsIdCb.empty();
		runsCombobox.empty();
		setErrMsg("");
		$('#run-select').hide();
		$('#tab-links a:eq(0)').trigger('click');

		if (event.target.files.length <= 0) {
			return;
		}

		var file = event.target.files[0];
		var fr = new FileReader();
		fr.onloadend = function(event) {
			attempts = Run.ArrayFromXML(event.target.result);
			segments = Segment.ArrayFromXML(event.target.result);
			setErrMsg("");
			setMsg(runInfo, "");
			setMsg(segInfo, "");
			segmentTabLoaded = false;

			if (attempts === null || segments === null) {
				setErrMsg("Invalid file", "alert-danger");
				return;
			}

			if (attempts.length === 0) {
				setMsg(runInfo, "No highlightable run was found.", "black");
				runsCombobox.selectpicker("hide");
			} else {
				//add complete runs to the combobox
				var fragment = document.createDocumentFragment()
				attempts.forEach(function(run, i) {
					var option = document.createElement("option");

					if (run.isStartedSynced === false || run.isEndedSynced === false)
					{
						$(option).addClass("bg-warning");
					}
					var useIgt = run.igt !== null;

					var timeStr = RunHighlighter._format_time(run.rta.asSeconds(), 2) + " RTA";
					if (run.igt !== null) {
						timeStr = RunHighlighter._format_time(run.igt.asSeconds(), 2) + " IGT / " + timeStr;
					}

					$(option).attr("data-subtext", "#" + run.id);
					option.textContent = timeStr + ", " + run.ended.from(moment.utc());
					fragment.appendChild(option);
				});
				runsCombobox.append(fragment);
				runsCombobox.selectpicker("show");
			}
			runsCombobox.selectpicker('refresh');

			$('#run-select').slideDown(100, "swing");
			console.log("Run Highlighter: found " + (attempts !== null ? attempts.length : 0) + " runs in \"" + file.name + "\"");
		};
		fr.readAsText(file);
	});

	$("#search-button").click(function() {
		if (searching) {
			console.log("Run Highligher: already searching");
			return;
		}

		var channel = $('input#channel').val();
		if (channel.length <= 0)
		{
			$('input#channel').parent().addClass("has-warning");
			var help_block = $("input#channel ~ .help-block");
			help_block.removeClass("hidden");
			help_block.text("Enter your channel name");
			return;
		}

		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("channel", channel);
		}

		searching = true;
		setErrMsg("Searching...", "alert-info");

		var run = getSelectedRun();
		if (run === undefined || run === null) {
			setErrMsg("Choose something to highlight first.", "alert-warning");
			searching = false;
			return;
		}

		console.log("RunHighlighter: Selected run:");
		console.log(run);

		try {
			console.log("Run Highlighter: started searching for video...");
			RunHighlighter.searchRun(channel, run, function(highlight){
				if (!highlight)
				{
					setErrMsg("No video matched in this channel.", "alert-danger");
					return;
				}

				var addon = document.body.hasAttribute("run-highlighter-addon");

				var start_str = RunHighlighter._format_time(highlight.start_time);
				var end_str = RunHighlighter._format_time(highlight.end_time);
				var link = ' <a' + (addon ? '' : ' target="_blank"') + ' href="' + highlight.addon_link  + '">'
					+ '<strong>' + highlight.link + '</strong></a>';
				var message = '<big><strong>Found it!</strong></big><br/><br/><strong>VOD</strong>: ' + link + '<br/>'
					+ '<strong>Start time:</strong> <kbd>' + start_str + '</kbd><br/>'
					+ '<strong>End time:</strong> <kbd>' + end_str + '</kbd>'
				if (!addon)
				{
					setErrMsg(message
						+ '<br/><br/>Install the <a href="https://github.com/Dalet/run-highlighter/releases/latest">Run Highligher add-on</a>'
						+ ' to set the highlight markers automatically!',
						"alert-success");
				} else {
					setErrMsg(message + '<br/><br/>You are being redirected to the highlighter page...</span>',
						"alert-success");
					window.location.href = highlight.addon_link;
				}
			});
		} catch (e) {
			console.error("Run Highlighter: " + e);
			setErrMsg("Error.", "alert-danger");
			searching = false;
		}
	});

	$("input#channel").change(function (event){
		var parent = $("input#channel").parent();
		var help_block = $("input#channel ~ .help-block");
		parent.removeClass("has-warning");
		parent.removeClass("has-error");
		help_block.addClass("hidden");
		cancelSearch();
	});

	// needed when the "previous page" button is used
	if ($("input#splits").get(0).files.length > 0)
	{
		$("input#splits").change();
	}

	if (typeof(Storage) !== "undefined") {
		$("input#channel").val(localStorage.getItem("channel"));
	}
})();
