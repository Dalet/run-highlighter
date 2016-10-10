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

	RunHighlighter.init();
	window.attempts = [];
	window.segments = [];
	window.segmentAttempts = null;
	window.runsCombobox = $('select[name="run"]');
	var segmentsNameCb = $('select[name="segmentName"]');
	window.segmentsIdCb = $('select[name="segmentId"]');
	var errorMessage = $("#error-message");
	var runInfo = $("#run-info");
	var segInfo = $("#segment-info");
	var searching = false;
	var segmentTabLoaded = false;
	window.redirect_interval = null;

	function getUrlVars() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	}

	window.formatChanged = function() {
		cancelSearch();
		setErrMsg("");
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

	window.getSelectedRun = function(what) {
		if (what === "run"
			|| (what === undefined && $('ul#tab-links li:eq(0)').hasClass("active")))
		{
			if (window.attempts.length === 0) return null;
			return window.attempts[window.runsCombobox[0].selectedIndex];
		}
		else if (what === "segment"
			|| (what === undefined && $('ul#tab-links li:eq(1)').hasClass("active")))
		{
			if (!window.segmentAttempts || window.segmentAttempts.length === 0) return null;
			return window.segmentAttempts[window.segmentsIdCb[0].selectedIndex];
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
			segInfo.text("No segments.");
		}
		segmentsNameCb.selectpicker('refresh');
	};

	function cancelSearch() {
		if (RunHighlighter._xhr && RunHighlighter._xhr.readyState !== XMLHttpRequest.UNSENT &&
			RunHighlighter._xhr.readyState !== XMLHttpRequest.DONE) {
				console.log("Run Highlighter: search aborted");
				RunHighlighter._xhr.abort();
			}
			searching = false;
		if (redirect_interval !== null)
			window.clearInterval(redirect_interval);
		redirect_interval = null;
	}

	runsCombobox.change(function(){
		cancelSearch();
		setErrMsg("");
		runInfo.text("");
		var run = getSelectedRun("run");
		if (run !== null) {
			if (run.isStartedSynced === false || run.isEndedSynced === false) {
				runInfo.text("This run might not be found precisely.");
			}
		}
	});

	segmentsNameCb.change(function() {
		cancelSearch();
		setErrMsg("");
		segInfo.text("");

		var selectedSegment = segments[segmentsNameCb[0].selectedIndex];
		segHistory = selectedSegment.getHistory(20);
		segmentAttempts = [];
		segmentsIdCb.empty();

		if (segHistory.length === 0){
			segmentsIdCb.selectpicker("hide");
			segInfo.text("No highlightable segment was found.");
		} else {
			var fragment = document.createDocumentFragment();
			segHistory.forEach(function(seg, i) {
				var run = seg.ToRun();
				if (run === null || run === undefined)
					return;

				var option = document.createElement("option");
				segmentAttempts.push(run);

				var timeStr = RunHighlighter._format_time(seg.rta.asSeconds(), 2) + " RTA";
				if (seg.igt) {
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
				segmentsIdCb.selectpicker("hide");
				segInfo.text("No highlightable segment was found.");
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
		segInfo.text("");
		var run = getSelectedRun("segment");
		if (run !== null) {
			if (run.isStartedSynced === false || run.isEndedSynced === false) {
				segInfo.text("This segment might not be found precisely.");
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
			attempts = Run.ArrayFromXML(event.target.result, 1500);
			segments = Segment.ArrayFromXML(event.target.result);
			setErrMsg("");
			runInfo.text("");
			segInfo.text("");
			segmentTabLoaded = false;

			if (attempts === null || segments === null) {
				setErrMsg("Invalid file", "alert-danger");
				return;
			}

			if (attempts.length === 0) {
				runInfo.text("No highlightable run was found.");
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

		RunHighlighter.settings.load();

		searching = true;
		setErrMsg('Searching...<span id="search-progress"></span>', "alert-info");

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
			RunHighlighter.searchRun(channel, run, function(highlight, requestInfo){
				if (!highlight)
				{
					// 2xx codes are not errors
					if (requestInfo.status >= 200 && requestInfo.status < 300)
					{
						setErrMsg("No video matched in channel '<strong>" + channel + "</strong>'.", "alert-warning");
						return;
					}

					var header = "<big><strong>An error has occurred!</strong></big><br><br>";
					switch (requestInfo.status)
					{
						case 0:
							setErrMsg(header + "The API request could not be sent.", "alert-danger");
							return;
						case 404:
							$('input#channel').parent().addClass("has-error");
						default:
							searching = false;
							header += "<strong>"+ requestInfo.status + " " + requestInfo.statusText + "</strong>"
								+ (!requestInfo.response || !requestInfo.response.message ? "" : "<br>" + requestInfo.response.message);
							setErrMsg(header, "alert-danger");
							return;
					}
				}

				var addon = document.body.hasAttribute("run-highlighter-addon");

				function highlight_message(h) {
					var start_str = RunHighlighter._format_time(h.start_time);
					var end_str = RunHighlighter._format_time(h.end_time);
					var link = ' <a class="vod-link" ' + (!addon || Array.isArray(highlight) ? ' target="_blank"': '')
						+ ' href="' + h.get_addon_link() + '">'
						+ '<strong>' + h.link + '</strong></a>';
					return '<strong>VOD</strong>: ' + link + '<br/>'
						+ '<strong>Start time:</strong> <kbd>' + start_str + '</kbd><br/>'
						+ '<strong>End time:</strong> <kbd>' + end_str + '</kbd>';
				}

				var message = "";

				var all_parts_found = !Array.isArray(highlight);
				if (!all_parts_found) {
					var start_found = false;
					var end_found = false;

					highlight.forEach(function (h, i) {
						if (h.part === "first")
							start_found = true;
						else if (h.part === "last")
							end_found = true;

						var part;
						if (h.part === "first") {
							part = "First part";
							h.title = h.title + " part 1";
						}
						else if (h.part === "last") {
							part = "Last part";
							var part_number = highlight.length + (start_found ? 0 : 1);
							h.title = h.title + " part " + part_number;
						}
						else {
							var part_number = i + (start_found ? 1 : 2);
							part = "Part " + part_number;
							h.title = h.title + " part " + part_number;
						}

						if (i == 0 && !start_found)
							message += '<h5><b>First part:</b></h5><span style="padding: 3px" class="bg-danger">Not found!</span><br/><br/>';

						if (i > 0)
							message += '<br/><br/>';
						message += '<h5><b>'+ part + ':</b></h5>';
						message += highlight_message(h);

						if (i == highlight.length - 1 && !end_found)
							message += '<br/><br/><h5><b>Last part:</b></h5><span style="padding: 3px" class="bg-danger">Not found!</span>';
					});

					all_parts_found = start_found && end_found;
				} else
					message += highlight_message(highlight);

				if (!all_parts_found) {
					message = '<h4><strong>Some parts are missing</strong></h4><br/>' + message;
					setErrMsg(message, "alert-success");
				} else {
					if (Array.isArray(highlight))
						message = '<h4><strong>Multiple parts found</strong></h4><br/>' + message;
					else
						message = '<h4><strong>Found it!</strong></h4><br/>' + message;
					setErrMsg(message, "alert-success");
				}

				if (Array.isArray(highlight)) {
					$("div#error-message").append('<br/><br/><a href="javascript:void(0)" id="open-all-vods">Open all VOD links</a>');
					$("a#open-all-vods").click(function() {
						$("a.vod-link").each(function() {
							window.open($(this).attr("href"), "_blank");
						});
					});
				} else if (addon) {
					setErrMsg(message + '<br/><br/>You will be redirected to the highlighter page in'
						+ ' <span id="redirection-countdown">3</span> seconds...'
						+ ' <a href="javascript:void(0)" id="cancel-redirection">cancel</a></span>',
						"alert-success");

					var cdElem = $("#redirection-countdown");
					redirect_interval = setInterval(function() {
						var secsLeft = parseInt(cdElem.text()) - 1;
						cdElem.text(secsLeft);
						if (secsLeft <= 0) {
							window.clearInterval(redirect_interval);
							redirect_interval = null;
							setErrMsg(message + '<br/><br/>You are being redirected to the highlighter page...</span>',
								"alert-success");
							window.location.href = highlight.get_addon_link();
							console.log("Redirecting to " + highlight.get_addon_link() + " ...");
						}
					}, 1000);

					$("a#cancel-redirection").click(function() {
						window.clearInterval(redirect_interval);
						redirect_interval = null;
						setErrMsg(message + "<br/><br/>Click the VOD link to start highlighting with the add-on.",
							"alert-success");
						console.log("Cancelled redirection.");
					});
				}

				if (!addon)
				{
					var link = '<a class="addon-download-link">Run Highligher add-on</a>';
					var text = '<br/><br/>Install the ' + link
						+ ' to set the highlight markers automatically!';
					$("div#error-message").append(text);
					makeDownloadLink($("#error-message .addon-download-link"));
				}
			},
			function(progress){
				$("#search-progress").text(" (" + progress.current + "/" + progress.total + " videos)");
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

	var urlVars = getUrlVars();
	if (urlVars["channel"] !== undefined) {
		$("input#channel").val(urlVars["channel"]);
	} else if (typeof(Storage) !== "undefined") {
		$("input#channel").val(localStorage.getItem("channel"));
	}

	function makeDownloadLink(elem) {
		elem.attr("href", "https://github.com/Dalet/run-highlighter/releases/latest");

		// shamelessly inspired by https://lordmau5.com/bttv4ffz/
		function isUnsupported(userAgent) {
			if(userAgent.indexOf("Edge/") > -1)
				return true;
			return false;
		}

		if(document.body.hasAttribute("run-highlighter-addon") || isUnsupported(navigator.userAgent))
			return;

		if(typeof InstallTrigger !== 'undefined') {
			var xhr = new XMLHttpRequest();
			var listener = function() {
				xhr.removeEventListener("load", listener);
				var ret = JSON.parse(xhr.response);
				ret.assets.some(function(asset){
					if (asset.content_type == "application/x-xpinstall"){
						elem.attr("href", asset.browser_download_url);
						return true;
					}
				});
			};
			xhr.addEventListener("load", listener);

			xhr.open("GET", "https://api.github.com/repos/Dalet/run-highlighter/releases/latest");
			xhr.send();
		}
		else if(!!window.chrome) {
			elem.attr("onclick", "chrome.webstore.install(); return false;");
		}
	}

	makeDownloadLink($(".addon-download-link"));
})();
