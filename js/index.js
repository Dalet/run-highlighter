"use strict";
(function() {
	RunHighlighter.init();

	var components = window.components = new (function() {
		this.channelInput = new Component(document.getElementById("channel"));

		this.fileInput = new FileInput(document.getElementById("splits"));

		this.runSelector = new RunSelector(
			document.querySelector('select[name="run"]'),
			document.getElementById("run-info")
		);

		var segInfo = document.getElementById("segment-info");
		this.segmentAttemptSelector = new SegmentAttemptSelector(
			document.querySelector('select[name="segmentId"'),
			segInfo
		);

		this.segmentSelector = new SegmentSelector(
			document.querySelector('select[name="segmentName"]'),
			segInfo,
			this.segmentAttemptSelector
		);

		this.messageDisplay = new MessageDisplay(document.getElementById("error-message"));
	});

	function getUrlVars() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	}

	$('#tab-links a').on('click', function(e) {
		e.preventDefault();
		var currentTab = this.getAttribute("href");

		// Show/Hide Tabs
		$('#tab-content ' + currentTab).show().siblings().hide();
		// Change/remove current tab to active
		$(this).parent('li').addClass('active').siblings().removeClass('active');

		components.search.cancel();
	});

	window.formatChanged = function() {
		components.search.cancel();
		components.messageDisplay.setMessage("");
	};

	components.fileInput.onChange = function(event) {
		var runSelector = components.runSelector;
		var segmentSelector = components.segmentSelector;
		runSelector.empty();
		segmentSelector.empty();

		components.messageDisplay.setMessage("");
		$('#run-select').hide();
		$('#tab-links a:eq(0)').trigger('click');

		var self = this;
		this.loadFile(function() {
			var fileContent = self.fileContent;
			runSelector.items = Run.ArrayFromXML(fileContent, runSelector.maxHistory);
			segmentSelector.items = Segment.ArrayFromXML(fileContent);
			components.messageDisplay.setMessage("");

			if (runSelector.items == null || segmentSelector.items == null) {
				components.messageDisplay.setMessage("Invalid file", "alert-danger");
				return;
			}

			$('#run-select').slideDown(100, "swing");
			console.log("Run Highlighter: found "
				+ (runSelector.items !== null ? runSelector.items.length : 0)
				+ " runs in \"" + self.element.files[0].name + "\"");
		});
	};

	components.search = new (function() {
		this.isSearching = false;
		this.redirect_interval = null;

		var self = this;

		this.getSelectedRun = function(what) {
			if (what === undefined) {
				if ($('ul#tab-links li:eq(0)').hasClass("active"))
					what = "run";
				else if ($('ul#tab-links li:eq(1)').hasClass("active"))
					what = "segment";
			}

			if (what == "run")
				return components.runSelector.selectedItem;
			if (what == "segment") {
				var item = components.segmentAttemptSelector.selectedItem;
				return item ? item.ToRun() : null;
			}
		};

		this.cancel = function() {
			RunHighlighter.cancelSearch();
			this.isSearching = false;
			components.messageDisplay.setMessage("");

			if (this.redirect_interval !== null) {
				window.clearInterval(this.redirect_interval);
				this.redirect_interval = null;
			}
		};

		this.search = function() {
			if (this.isSearching) {
				console.log("Run Highligher: already searching");
				return;
			}

			var channelElem = components.channelInput.jElement;
			var channel = channelElem.val();
			if (channel.length <= 0)
			{
				channelElem.parent().addClass("has-warning");
				var help_block = channelElem.siblings(".help-block");
				help_block.removeClass("hidden");
				help_block.text("Enter your channel name");
				return;
			}

			if (typeof(Storage) !== "undefined") {
				localStorage.setItem("channel", channel);
			}

			RunHighlighter.settings.load();

			this.isSearching = true;
			components.messageDisplay.setMessage('Searching...<span id="search-progress"></span>', "alert-info");

			var run = components.search.getSelectedRun();
			if (run === undefined || run === null) {
				components.messageDisplay.setMessage("Choose something to highlight first.", "alert-warning");
				this.isSearching = false;
				return;
			}

			console.log("RunHighlighter: Selected run:");
			console.log(run);

			try {
				console.log("Run Highlighter: started searching for video...");
				RunHighlighter.searchRun(channel, run, function(highlight, requestInfo) {
						self.makeResultMessage(channel, highlight, requestInfo);
					},
					function(progress) {
						$("#search-progress").text(" (" + progress.current + "/" + progress.total + " videos)");
					}
				);
			} catch (e) {
				console.error("Run Highlighter: " + e);
				components.messageDisplay.setMessage("Error.", "alert-danger");
				this.isSearching = false;
			}
		};

		this.makeResultMessage = function (channel, highlight, requestInfo) {
			if (!highlight) {
				// 2xx codes are not errors
				if (requestInfo.status >= 200 && requestInfo.status < 300) {
					components.messageDisplay.setMessage("No video matched in channel '<strong>" + channel + "</strong>'.", "alert-warning");
					return;
				}

				var header = "<big><strong>An error has occurred!</strong></big><br><br>";
				switch (requestInfo.status) {
					case 0:
						components.messageDisplay.setMessage(header + "The API request could not be sent.", "alert-danger");
						return;
					case 404:
						components.channelInput.jElement.parent().addClass("has-error");
					default:
						this.isSearching = false;
						header += "<strong>" + requestInfo.status + " " + requestInfo.statusText + "</strong>"
							+ (!requestInfo.response || !requestInfo.response.message ? "" : "<br>" + requestInfo.response.message);
						components.messageDisplay.setMessage(header, "alert-danger");
						return;
				}
			}

			var addon = document.body.hasAttribute("run-highlighter-addon");

			function highlight_message(h) {
				var start_str = RunHighlighter._format_time(h.start_time);
				var end_str = RunHighlighter._format_time(h.end_time);
				var link = ' <a class="vod-link" ' + (!addon || Array.isArray(highlight) ? ' target="_blank"' : '')
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
					} else if (h.part === "last") {
						part = "Last part";
						var part_number = highlight.length + (start_found ? 0 : 1);
						h.title = h.title + " part " + part_number;
					} else {
						var part_number = i + (start_found ? 1 : 2);
						part = "Part " + part_number;
						h.title = h.title + " part " + part_number;
					}

					if (i == 0 && !start_found)
						message += '<h5><b>First part:</b></h5><span style="padding: 3px" class="bg-danger">Not found!</span><br/><br/>';

					if (i > 0)
						message += '<br/><br/>';
					message += '<h5><b>' + part + ':</b></h5>';
					message += highlight_message(h);

					if (i == highlight.length - 1 && !end_found)
						message += '<br/><br/><h5><b>Last part:</b></h5><span style="padding: 3px" class="bg-danger">Not found!</span>';
				});

				all_parts_found = start_found && end_found;
			} else
				message += highlight_message(highlight);

			var header = "Found it!";
			if (!all_parts_found) {
				header = "Some parts are missing";
			} else if (Array.isArray(highlight)) {
				header = "Multiple parts found";
			}

			message = "<h4><strong>" + header + "</strong></h4><br>" + message;
			components.messageDisplay.setMessage(message, "alert-success");

			if (Array.isArray(highlight)) {
				$("div#error-message").append('<br/><br/><a href="javascript:void(0)" id="open-all-vods">Open all VOD links</a>');
				$("a#open-all-vods").click(function () {
					$("a.vod-link").each(function () {
						window.open($(this).attr("href"), "_blank");
					});
				});
			} else if (addon) {
				components.messageDisplay.setMessage(message + '<br/><br/>You will be redirected to the highlighter page in'
					+ ' <span id="redirection-countdown">3</span> seconds...'
					+ ' <a href="javascript:void(0)" id="cancel-redirection">cancel</a></span>',
					"alert-success");

				var cdElem = $("#redirection-countdown");
				self.redirect_interval = window.setInterval(function () {
					var secsLeft = parseInt(cdElem.text()) - 1;
					cdElem.text(secsLeft);
					if (secsLeft <= 0) {
						window.clearInterval(self.redirect_interval);
						self.redirect_interval = null;
						components.messageDisplay.setMessage(message + '<br/><br/>You are being redirected to the highlighter page...</span>',
							"alert-success");
						window.location.href = highlight.get_addon_link();
						console.log("Redirecting to " + highlight.get_addon_link() + " ...");
					}
				}, 1000);

				$("a#cancel-redirection").click(function () {
					window.clearInterval(self.redirect_interval);
					self.redirect_interval = null;
					components.messageDisplay.setMessage(message + "<br/><br/>Click the VOD link to start highlighting with the add-on.",
						"alert-success");
					console.log("Cancelled redirection.");
				});
			}

			if (!addon) {
				var link = '<a class="addon-download-link">Run Highligher add-on</a>';
				var text = '<br/><br/>Install the ' + link
					+ ' to set the highlight markers automatically!';
				$("div#error-message").append(text);
				makeDownloadLink($("#error-message .addon-download-link"));
			}
		};
	});

	$("#search-button").click(function() {
		components.search.search();
	});

	components.channelInput.element.addEventListener("change", function (e){
		var channelInput = $(e.target);
		var parent = channelInput.parent();
		var help_block = channelInput.siblings(".help-block");
		parent.removeClass("has-warning");
		parent.removeClass("has-error");
		help_block.addClass("hidden");
		components.search.cancel();
	});

	// needed when the "previous page" button is used
	if (components.fileInput.element.files.length > 0) {
		components.fileInput.element.dispatchEvent(new Event("change"));
	}

	var urlVars = getUrlVars();
	if (urlVars["channel"] !== undefined) {
		components.channelInput.element.value = urlVars["channel"];
	} else if (typeof(Storage) !== "undefined") {
		components.channelInput.element.value = localStorage.getItem("channel");
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
