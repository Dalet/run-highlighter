(function() {
	if (document.body.hasAttribute("run-highlighter-addon"))
		return;
	document.body.setAttribute("run-highlighter-addon", "");
	console.log("Run Highlighter: injected");

	/*
	* Highlighter object
	*/
	var Highlighter = Highlighter || {

		highlight: function() {
			var urlVars = this._getUrlVars();
			this.start_time = parseInt(urlVars.start_time);
			this.end_time = parseInt(urlVars.end_time);
			this.automate = parseInt(urlVars.automate) === 1;
			this.title = null;

			if (urlVars.title !== undefined && urlVars.title.length > 0) {
				try {
					this.title = window.atob(decodeURIComponent(urlVars.title));
				} catch (e) { this.title = null; }
			}

			if (!isNaN(this.start_time) || !isNaN(this.end_time))
				this._markerLoop();
			if (!isNaN(this.start_time))
				this._seekToStart();
		},

		isPlayerReady: function() {
			try {
				if (this.getPlayer().getVideoTime() >= 0)
					return true;
			} catch (e) { }
			return false;
		},

		getPlayer: function() {
			return $("div#player").find("object")[0];
		},

		_getUrlVars: function() {
			var vars = {};
			var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
				vars[key] = value;
			});
			return vars;
		},

		_format_time: function(seconds, decimals) {
			decimals = decimals || 0;
			var hours = Math.floor(seconds / 3600);
			if (hours > 0) {
				seconds -= hours * 3600;
				hours = hours + ":";
			}
			else
				hours = "";

			var minutes = Math.floor(seconds / 60);
			seconds -= minutes * 60;
			if (hours !== "" && minutes < 10)
				minutes = "0" + minutes;

			seconds = seconds.toFixed(decimals);
			if (seconds < 10)
				seconds = "0" + seconds;
			return hours + minutes + ":" + seconds;
		},

		_setStartValue: function(seconds) {
			if (isNaN(seconds))
				return;
			var elem = document.querySelector("input.start-time.string");
			elem.value = this._format_time(seconds);
			$("input[name=start_time]").val(seconds);
			this._globalTrigger(elem, "change"); //move markers
		},

		_setEndValue: function(seconds) {
			if (isNaN(seconds))
				return;
			var elem = document.querySelector("input.end-time.string");
			elem.value = this._format_time(seconds);
			$("input[name=end_time]").val(seconds);
			this._globalTrigger(elem, "change"); //move markers
		},

		_globalTrigger: function(elem, evnt) {
			var e = document.createEvent("HTMLEvents");
			e.initEvent(evnt, true, true);
			elem.dispatchEvent(e); //move markers
		},

		_fillForm: function() {
			console.log("Run Highlighter: updating time ranges");
			this._setStartValue(this.start_time);
			this._setEndValue(this.end_time);

			if (this.title !== null)
				$("input[name=title]").val(this.title);

			$("input[name=tag_list]").val("speedrun, speedrunning");

			if (!isNaN(this.start_time) && !isNaN(this.end_time)) {
				//click "Describe Highlight"
				$("div .highlight-content").find("button:eq(0)").click();
				//click "Create Highlight"
				if (this.automate === true)
					$("div .highlight-content").find("button:eq(1)").click();
			}
		},

		//waits for the player to load and seeks to the highlight start
		_seekToStart: function() {
			if (this.start_time <= 1)
				return;
			var self = this;
			var player = this.getPlayer();
			setTimeout(function () {
				if (player !== undefined && player.getVideoTime !== undefined
					&& player.getVideoTime() > 0) {
					player.videoSeek(self.start_time);
					console.log("Run Highlighter: seeked to " + self.start_time);
				} else
					self._seekToStart();
			}, 250);
		},

		_markerLoop: function() {
			var self = this;
			setTimeout(function() {
				if (self.isPlayerReady()) {
					console.log("Run Highlighter: player ready");
					self._fillForm();
				} else
					self._markerLoop();
			}, 250);
		}
	};

	var inject = function(src, callback) {
		var s = document.createElement('script');
		s.src = src;
		s.async = true;
		s.onload = function() { this.parentNode.removeChild(this); };
		if (callback) {
			s.onreadystatechange = s.onload = function() {
				if (!callback.done && (!s.readyState || /loaded|complete/.test(s.readyState))) {
					callback.done = true;
					callback();
				}
			};
		}
		document.head.appendChild(s);
	}

	if (!/(www\.)?twitch\.tv$/.test(window.location.hostname))
		return;

	inject("https://dalet.github.io/run-highlighter/js/waitForKeyElements.js", function() {
		if (/^\/[^\/]+\/manager\/[^\/]+\/highlight\/?$/.test(window.location.pathname))
			Highlighter.highlight();

		var rh_url = "https://dalet.github.io/run-highlighter/";
		var currentUrl = null;

		setInterval(function() {
			if (window.location.href === currentUrl)
				return;
			currentUrl = window.location.href;

			if (/^\/[^\/]+\/manager\/[^\/]+\/highlight\/?$/.test(window.location.pathname)) {
				waitForKeyElements("form.highlight-form fieldset h4:eq(0)", function() {
					var link = $('<a href="' + rh_url + '">use Run Highlighter</a>');
					$("form.highlight-form fieldset h4:eq(0)").append("<br/>or ").append(link);
				});
			} else if (/^\/[^\/]+\/manager\/(past_broadcasts|highlights)\/?$/.test(window.location.pathname)
				|| /^\/[^\/]+\/profile(\/[^\/]+)?\/?$/.test(window.location.pathname)) {
				// prevent injecting in pages that aren't channels profile
				var channel = window.location.pathname.split("/")[1];
				var blacklist = ["settings"];
				if (blacklist.indexOf(channel) < 0) {
					waitForKeyElements("div .directory_header li:eq(1)", function() {
						var link = $('<li><a href="' + rh_url +'">Run Highlighter</a></li>');
						$("div .directory_header li:eq(1)").after(link);
					});
				}
			}
		}, 1000);
	});
})();