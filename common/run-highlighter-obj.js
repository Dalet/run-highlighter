jQuery.fn.reverse = function() {
	return this.pushStack(this.get().reverse(), arguments);
};

console.log("Run Highlighter: code injected");

var RunHighlighter = RunHighlighter || {
	settings: {
		buffer: 7
	},
	_xhr: new XMLHttpRequest(),

	highlight: function() {
		var urlVars = this._getUrlVars();
		this.start_time = parseInt(urlVars.start_time);
		this.end_time = parseInt(urlVars.end_time);
		this.automate = parseInt(urlVars.automate) === 1;

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
				var end_time = start_time + Math.ceil(duration);
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

		var $doc;
		try {
			var xmlDoc = $.parseXML(str);
			$doc = $(xmlDoc);
		} catch (e) { return null; }

		var $attemptsElem = $doc.find("AttemptHistory");
		if ($attemptsElem && $attemptsElem.length <= 0)
			return null;
		var attempts = [];
		$attemptsElem.children("Attempt[started]").reverse().each(function(i) {
			if ($(this).children("RealTime").length > 0) {
				var attempt = self._attemptFromXML($(this));
				if (attempt)
					attempts.push(attempt);
				if (attempts.length >= max)
					return false;
			}
		});
		return attempts;
	},

	_attemptFromXML: function(elem) {
		if (elem === undefined || elem === null)
			return null;

		var self = this;

		return {
			id: elem.attr("id"),
			started: elem.attr("started") !== undefined
				? moment.utc(elem.attr("started"), ["MM-DD-YYYY HH:mm:ss", "DD-MM-YYYY HH:mm:ss"])
				: null,
			isStartedSynced: elem.attr("isStartedSynced") !== undefined
				? elem.attr("isStartedSynced").toLowerCase() === 'true'
				: null,
			ended: elem.attr("ended") !== undefined
				? moment.utc(elem.attr("ended"), ["MM-DD-YYYY HH:mm:ss", "DD-MM-YYYY HH:mm:ss"])
				: null,
			isEndedSynced: elem.attr("ended") !== undefined
				? elem.attr("isEndedSynced").toLowerCase() === 'true'
				: null,
			rta: elem.children("RealTime").length > 0
				? moment.duration(elem.children("RealTime").text())
				: null,
			igt: elem.children("GameTime").length > 0
				? moment.duration(elem.children("GameTime").text())
				: null
		};
	},

	segmentToRun: function(seg) {
		var run = {};
		var timeUntilSeg = this._timeUntilSegmentAttempt(seg);
		if (timeUntilSeg === null)
			return null;
		run.started = seg.attempt.started.clone().add(timeUntilSeg);
		run.ended = run.started.clone().add(seg.rta);
		run.isStartedSynced = seg.attempt.isStartedSynced;
		run.isEndedSynced = seg.attempt.isEndedSynced;
		run.rta = seg.rta;
		run.igt = seg.igt;
		return run;
	},

	_timeUntilSegmentAttempt: function(segAttempt) {
		var root = segAttempt.segment.historyElem.closest("Run");
		var time = null;
		root.find("Segments").children("Segment").each(function(i, elem) {
			elem = $(elem);
			var timeElem = elem.children("SegmentHistory").children('Time[id="'+ segAttempt.attempt.id +'"]');
			if (timeElem.length > 0 && timeElem.children("RealTime").length > 0) {
				if (time === null)
					time = moment.duration(0);
				if (elem.children("Name").text() === segAttempt.segment.name)
					return false;
				time.add(moment.duration(timeElem.children("RealTime").text()));
			}
			return true;
		});
		return time;
	},

	segmentsFromXML: function(str) {
		var self = this;
		var $doc;
		try {
			var xmlDoc = $.parseXML(str);
			$doc = $(xmlDoc);
		} catch (e) { return null; }

		var $segmentsElem = $doc.find("Segments");
		if ($segmentsElem && $segmentsElem.length <= 0)
			return null;
		var segments = [];
		var runs = [];
		$doc.find("AttemptHistory").children("Attempt[started]:has(RealTime)").each(function() {
			runs.unshift(self._attemptFromXML($(this)));
		});
		$segmentsElem.children("Segment").each(function(i) {
			var segment = self._segmentFromXML($(this));
			segment.attempts = runs;
			if (segment)
				segments.push(segment);
		});
		return segments;
	},

	_segmentFromXML: function(elem) {
		var self = this;
		if (elem.children("Name").length === 0)
			return null;

		//////////////
		// SEGMENTS //
		//////////////
		var segment = {};
		segment.name = elem.children("Name").text();
		var best = elem.children("BestSegmentTime");
		segment.bestRta = null;
		segment.bestIgt = null;
		if (best.children("RealTime").length > 0)
			segment.bestRta = moment.duration(best.children("RealTime").text());
		if (best.children("GameTime").length > 0)
			segment.bestIgt = moment.duration(best.children("GameTime").text());
		segment.historyElem = elem.children("SegmentHistory");

		//PB segment
		segment.pbRta = null;
		segment.pbIgt = null;
		var pbElem = elem.find('SplitTime[name="Personal Best"]');
		var previous = elem.prev();
		if (previous.length > 0 ) {
			var previousT = previous.find('SplitTime[name="Personal Best"]');
			var currSplit, prevSplit;
			if (previousT.children("RealTime").length > 0) {
				prevSplit = moment.duration(previousT.children("RealTime").text());
				currSplit = moment.duration(pbElem.children("RealTime").text());
				currSplit.subtract(prevSplit);
				segment.pbRta = moment.duration(currSplit.asMilliseconds());
			}
			if (previousT.children("GameTime").length > 0) {
				prevSplit = moment.duration(previousT.children("GameTime").text());
				currSplit = moment.duration(pbElem.children("GameTime").text());
				currSplit.subtract(prevSplit);
				segment.pbIgt = moment.duration(currSplit.asMilliseconds());
			}
		} else {
			if (pbElem.children("RealTime").length > 0)
				segment.pbRta = moment.duration(pbElem.children("RealTime").text());
			if (pbElem.children("GameTime").length > 0)
				segment.pbIgt = moment.duration(pbElem.children("GameTime").text());
		}

		segment.useIgt = segment.pbIgt !== null;

		//if PB is shorter than stored best then PB is best
		if (segment.pbRta !== null) {
			if (segment.bestRta === null || (segment.pbRta.asMilliseconds() < segment.bestRta.asMilliseconds()))
				segment.bestRta = moment.duration(segment.pbRta.asMilliseconds());
		}
		if (segment.pbIgt !== null) {
			if (segment.bestIgt === null || segment.pbIgt.asMilliseconds() < segment.bestIgt.asMilliseconds())
				segment.bestIgt = moment.duration(segment.pbIgt.asMilliseconds());
		}

		//////////////////////
		// SEGMENT ATTEMPTS //
		//////////////////////
		segment.getHistory = function(max) {
			max = max || 25;
			var history = [];
			var foundBest = false;
			var x = 0;
			this.attempts.forEach(function(attempt) {
				var elem = segment.historyElem.children('Time[id="' + attempt.id + '"]');
				if (elem.children().length > 0)
				{
					var segAttempt = {};
					segAttempt.attempt = attempt;
					segAttempt.segment = segment;
					segAttempt.rta = elem.children("RealTime").length > 0
						? moment.duration(elem.children("RealTime").text())
						: null;
					segAttempt.igt = elem.children("GameTime").length > 0
						? moment.duration(elem.children("GameTime").text())
						: null;

					if (segment.useIgt === true) {
					segAttempt.isBest = segment.bestIgt !== null && segAttempt.igt !== null
							&& segment.bestIgt.asMilliseconds() === segAttempt.igt.asMilliseconds();
					} else {
						segAttempt.isBest = segment.bestRta !== null
							&& segAttempt.rta.asMilliseconds() === segment.bestRta.asMilliseconds();
					}

					if (segAttempt.isBest) {
						history.unshift(segAttempt);
						foundBest = true;
					}
					else if (history.length < max)
						history.push(segAttempt);

					x++;
					if ((history.length >= max && foundBest === true) || x >= 1000)
						return false;
				}
			});
			return history;
		};
		return segment;
	},
};
