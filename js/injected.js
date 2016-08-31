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
			this._player = null;

			if (urlVars.title !== undefined && urlVars.title.length > 0) {
				try {
					this.title = window.atob(decodeURIComponent(urlVars.title));
				} catch (e) { this.title = null; }
			}

			this._waitForPlayer(0);
		},

		_waitForPlayer: function(delay) {
			var self = this;
			setTimeout(function() {
				var player = self.getPlayer();
				if (player) {
					console.log("Run Highlighter: Player found");
					// use video events for html5
					if (self.isPlayerHTML5()) {
						var loadedmetadata = function() {
							console.log("Run Highlighter: loadedmetadata, started filling form and seeking");
							self._fillForm();
							self._seekToStartLoop();
						};
						if (self.isPlayerReady()) {
							console.log("Run Highlighter: player was ready before setting up listener, firing manually");
							loadedmetadata();
						}
						$(player).on("loadedmetadata", loadedmetadata);
					} else { // use a loop for flash
						self._playerReadyLoop(0);
					}
				} else
					self._waitForPlayer();
			}, delay !== undefined ? delay : 75);
		},

		isPlayerReady: function() {
			try {
				var player = this.getPlayer();
				if (player && this.isPlayerHTML5()) {
					return player.duration > 0;
				}
				else if (player.getVideoTime() > 0)
					return true;
			} catch (e) { }
			return false;
		},

		getPlayer: function() {
			if (this._player)
				return this._player;
			return this._player = $("div.player video")[0] || $("div#player").find("object")[0];
		},

		isPlayerHTML5: function() {
			return this.getPlayer().tagName.toLowerCase() === "video";
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
				$("form.highlight-form").find("button:eq(0)").click();
				//click "Create Highlight"
				if (this.automate === true)
					$("form.highlight-form").find("button:eq(1)").click();
			}
		},

		getPlayerCurrentTime: function() {
			if (this.isPlayerHTML5())
				return this.getPlayer().currentTime;
			else
				return this.getPlayer().getVideoTime();
		},

		_seekToStart: function() {
			var player = this.getPlayer();
			if (this.isPlayerHTML5())
				player.currentTime = this.start_time;
			else
				player.videoSeek(this.start_time);
			console.log("Run Highlighter: seeked to " + this.start_time);
		},

		_seekToStartLoop: function(delay) {
			if (isNaN(this.start_time) || this.start_time <= 0)
				return;

			var self = this;
			setTimeout(function () {
				if (self.getPlayerCurrentTime() > 0)
					self._seekToStart();
				else
					self._seekToStartLoop();
			}, delay !== undefined ? delay : 250);
		},

		//waits for the player to load to do stuff (flash only)
		_playerReadyLoop: function(delay) {
			if (isNaN(this.start_time) || isNaN(this.end_time))
				return;

			var self = this;
			setTimeout(function() {
				if (self.isPlayerReady()) {
					console.log("Run Highlighter: player ready, started filling & seeking");
					self._fillForm();
					self._seekToStartLoop(500);
				} else
					self._playerReadyLoop();
			}, delay !== undefined ? delay : 250);
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

		var currentUrl = null;

		setInterval(function() {
			if (window.location.href === currentUrl)
				return;
			currentUrl = window.location.href;
			var channel = window.location.pathname.split("/")[1];
			var rh_url = "https://dalet.github.io/run-highlighter/?channel=" + channel;

			if (/^\/[^\/]+\/manager\/[^\/]+\/highlight\/?$/.test(window.location.pathname)) {
				waitForKeyElements("form.highlight-form fieldset h4:eq(0)", function() {
					var link = $('<a href="' + rh_url + '">use Run Highlighter</a>');
					$("form.highlight-form fieldset h4:eq(0)").append("<br/>or ").append(link);
				}, true);
			} else if (/^\/[^\/]+\/manager\/(past_broadcasts|highlights)\/?$/.test(window.location.pathname)
				|| /^\/[^\/]+\/profile(\/[^\/]+)?\/?$/.test(window.location.pathname)) {
				// prevent injecting in pages that aren't channels profile
				var blacklist = ["settings"];
				if (blacklist.indexOf(channel) < 0) {
					waitForKeyElements("div .directory_header li:eq(1)", function() {
						var link = $('<li><a href="' + rh_url +'">Run Highlighter</a></li>');
						$("div .directory_header li:eq(1)").after(link);
					}, true);
				}
			}
		}, 750);
	});
})();
