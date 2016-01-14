jQuery.fn.reverse = function() {
    return this.pushStack(this.get().reverse(), arguments);
};

console.log("Run Highlighter: code injected");

var RunHighlighter = RunHighlighter || {
	settings: {
		buffer: 6
	},
	_xhr: new XMLHttpRequest(),

	highlight: function() {
		var urlVars = this._getUrlVars();
		this.start_time = parseInt(urlVars["start_time"]);
		this.end_time = parseInt(urlVars["end_time"]);
		this.automate = parseInt(urlVars["automate"]) === 1;

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

	_format_time: function(seconds) {
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

		if (seconds < 10)
			seconds = "0" + seconds;
		return hours + minutes + ":" + seconds ;
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

		//$("input[name=title]").val("{game} speedrun in {igt} ({rta} RTA)");
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
	},

	_twitchApiCall: function(str, callback){
		var self = this;
		var listener = function() {
			self._xhr.removeEventListener("load", listener);
			callback();
		};
		this._xhr.addEventListener("load", listener);

		//prevent caching
		if (str.indexOf("?") >= 0)
			str += "&random="+ new Date().getTime();
		else
			str += "?random=" + new Date().getTime();

		var url = str.indexOf("http") !== 0
			? "https://api.twitch.tv/kraken/" + str
			: str;
		this._xhr.open("GET", url);
		this._xhr.send();
	},

	searchVideo: function(vid, run){
		var vidStart = moment.utc(vid.recorded_at);
		var vidEnd = vidStart.clone().add(vid.length, 'seconds');
		if (vidStart.isSameOrBefore(run.started) && vidEnd.isSameOrAfter(run.ended)) {
			return true;
		}
		return false;
	},

	searchRun: function(channel, run, callback){
		var self = this;
		var videoCount = 0;
		var listener = function(event) {
			var ret = JSON.parse(self._xhr.response);
			videoCount += ret.videos.length;
			console.log("Run Highlighter: retrieved " + videoCount + " out of " + ret._total + " total...");
			var video = null;
			var cancel = false;
			ret.videos.some(function(vid, i, array){
				if(self.searchVideo(vid, run)){
					video = vid;
					console.log("Run Highlighter: found matching video id: " + video._id);
					return true;
				}
				else if (moment.utc(vid.recorded_at).isBefore(run.started)) {
					//stop searching if the other videos are older than the run
					cancel = true;
					console.log("Run Highlighter: stopped searching at vid n°" + (i + 1 + videoCount - array.length));
					return true;
				}
				return false;
			});

			if (video) {
				var start_time = Math.floor(run.started.diff(moment(video.recorded_at)) / 1000);
				var duration = run.ended.diff(run.started) / 1000;
				var end_time = start_time + duration;
				start_time -= self.settings.buffer;
				end_time += self.settings.buffer;
				if (start_time < 0) start_time = 0;
				if (end_time > Math.floor(video.length)) end_time = Math.floor(video.length);
				var link = "http://www.twitch.tv/" + channel + "/manager/" + video._id +
					"/highlight?start_time=" + start_time + "&end_time=" + end_time;
				callback(link);
			} else if (!cancel && ret._total > videoCount) {
				self._twitchApiCall(ret._links.next, listener);
			} else {
				callback(null);
			}
		};
		this._twitchApiCall("channels/" + channel + "/videos?broadcasts=true", listener);
	},

	runsFromXML: function(str, max) {
		var self = this;
		max = max || 20;

		try {
			var xmlDoc = $.parseXML(str);
			var $doc = $(xmlDoc);
		} catch (e) { return null; }

		var $attemptsElem = $doc.find("AttemptHistory");
		if ($attemptsElem && $attemptsElem.length <= 0)
			return null;
		var attempts = [];
		$attemptsElem.children("Attempt[started]").reverse().each(function(i) {
			var attempt = self._attemptFromXML($(this));
			if (attempt)
				attempts.push(attempt);
			if (attempts.length >= max)
				return false;
		});
		return attempts;
	},

	_attemptFromXML: function(elem) {
		if (elem.children("RealTime").length > 0) {
			var rta = elem.children("RealTime").text();
			rta = rta.substring(0, rta.indexOf('.')); //remove decimals
			while (rta.indexOf('00:') == 0 && rta.split(":").length > 2)
				rta = rta.substr(3);

			return {
				id: elem.attr("id"),
				started: moment.utc(elem.attr("started"), ["MM-DD-YYYY HH:mm:ss", "DD-MM-YYYY HH:mm:ss"]),
				isStartedSynced: elem.attr("isStartedSynced").toLowerCase() === 'true',
				ended: moment.utc(elem.attr("ended"), ["MM-DD-YYYY HH:mm:ss", "DD-MM-YYYY HH:mm:ss"]),
				isEndedSynced: elem.attr("isEndedSynced").toLowerCase() === 'true',
				rta: rta
			};
		}
		return null;
	}
};
