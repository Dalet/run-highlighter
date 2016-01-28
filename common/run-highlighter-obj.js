console.log("Run Highlighter: code injected");

/*
* Run class
*/
var Run = function() {
	this.started = null;
	this.ended = null;
	this.isStartedSynced = null;
	this.isEndedSynced = null;
	this.rta = null;
	this.igt = null;
};

Run.FromXML = function(elem) {
	if (elem === undefined || elem === null)
		throw "elem cannot be undefined or null";

	var run = new Run();

	if (elem.attr("id") !== undefined)
		run.id = elem.attr("id");

	if (elem.attr("started") !== undefined)
		run.started = moment.utc(elem.attr("started"), ["MM-DD-YYYY HH:mm:ss", "DD-MM-YYYY HH:mm:ss"]);

	if (elem.attr("ended") !== undefined)
		run.ended = moment.utc(elem.attr("ended"), ["MM-DD-YYYY HH:mm:ss", "DD-MM-YYYY HH:mm:ss"]);

	if (elem.attr("isStartedSynced") !== undefined)
		run.isStartedSynced = elem.attr("isStartedSynced").toLowerCase() === 'true';

	if (elem.attr("ended") !== undefined )
		run.isEndedSynced = elem.attr("isEndedSynced").toLowerCase() === 'true';

	if (elem.children("RealTime").length > 0)
		run.rta = moment.duration(elem.children("RealTime").text());

	if (elem.children("GameTime").length > 0)
		run.igt = moment.duration(elem.children("GameTime").text());

	return run;
};

Run.ArrayFromXML = function(str, max) {
	if (str === undefined || str === null)
		throw "str cannot be undefined or null";

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
	var elems = $attemptsElem.children("Attempt[started]:has(RealTime)");
	for (i = elems.length - 1; i >= 0; i--) {
		var attempt = Run.FromXML($(elems[i]));
		if (attempt)
			attempts.push(attempt);
		if (attempts.length >= max)
			break;
	}
	return attempts;
};


/*
* Segment class
*/
var Segment = function() {
	this.name = null;
	this.bestRta = null;
	this.bestIgt = null;
	this.pbRta = null;
	this.pbIgt = null;
	this.attemptsElem = null;
	this.historyElem = null;
	this.useIgt = false;
	this.history = null;
};

Segment.FromXML = function(elem) {
	if (elem === undefined || elem === null)
		throw "elem cannot be undefined or null";

	if (elem.children("Name").length === 0)
		return null;

	var segment = new Segment();

	segment.name = elem.children("Name").text();
	var best = elem.children("BestSegmentTime");
	if (best.children("RealTime").length > 0)
		segment.bestRta = moment.duration(best.children("RealTime").text());
	if (best.children("GameTime").length > 0)
		segment.bestIgt = moment.duration(best.children("GameTime").text());
	segment.historyElem = elem.children("SegmentHistory");

	//PB segment
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

	return segment;
};

Segment.ArrayFromXML = function(str) {
	if (str === undefined || str === null)
		throw "str cannot be undefined or null";

	var $doc;
	try {
		var xmlDoc = $.parseXML(str);
		$doc = $(xmlDoc);
	} catch (e) { return null; }

	var $segmentsElem = $doc.find("Segments");
	if ($segmentsElem && $segmentsElem.length <= 0)
		return null;

	var attemptsElem = $doc.find("AttemptHistory").children("Attempt[started]");
	if (attemptsElem.length > 1000)
		attemptsElem.slice(attemptsElem.length - 1000, attemptsElem.length);

	var segments = [];
	$segmentsElem.children("Segment").each(function(i) {
		var segment = Segment.FromXML($(this));
		if (segment) {
			segment.attemptsElem = attemptsElem;
			segments.push(segment);
		}
	});
	return segments;
};

Segment.prototype.getHistory = function(max) {
	var funcStart = performance.now();
	if (this.history !== null) {
		console.log("Run Highlighter: returned cached history");
		return this.history;
	}

	console.log("Run Highlighter: parsing segment history...");

	max = max || 25;
	var history = [];
	var foundBest = false;
	var foundPb = false;

	var segment = this;
	var elems = this.historyElem.children();
	for (i = elems.length - 1; i >= 0; i--) {
		var id = $(elems[i]).attr("id");
		var attemptElem = segment.attemptsElem.filter('#' + id);

		if (attemptElem.length === 0)
			continue;

		var attempt = Run.FromXML(attemptElem);
		var segAttempt = SegmentAttempt.FromAttempt(segment, attempt);

		if (segAttempt.isPb)
			foundPb = true;

		if (segAttempt.isBest) {
			history.unshift(segAttempt);
			foundBest = true;
		}
		else if (history.length < max) {
			history.push(segAttempt);
		}

		if (history.length >= max
			&& ((foundBest === true && foundPb === true)
			|| moment.duration(moment().diff(attempt.ended)).asDays() > 30)) {
			console.log("Run Highlighter: Stopped traversing segment history after " + (elems.length - i) + " entries");
			break;
		}
	}

	this.history = history;
	console.log("Run Highlighter: getHistory() took " + (performance.now() - funcStart).toFixed(0) + "ms");
	return history;
};


/*
* SegmentAttempt class
*/
var SegmentAttempt = function SegmentAttempt()
{
	this.attempt = null;
	this.segment = null;
	this.rta = null;
	this.igt = null;
	this.isBest = false;
	this.isPb = false;
};

SegmentAttempt.FromAttempt = function(segment, attempt) {
	var elem = segment.historyElem.children('#' + attempt.id);
	if (elem.children().length === 0)
		return null;

	var segAttempt = new SegmentAttempt();
	segAttempt.attempt = attempt;
	segAttempt.segment = segment;
	if (elem.children("RealTime").length > 0)
		segAttempt.rta = moment.duration(elem.children("RealTime").text());
	if (elem.children("GameTime").length > 0)
		segAttempt.igt = moment.duration(elem.children("GameTime").text());

	if (self.useIgt === true && segAttempt.igt !== null) {
		segAttempt.isBest = segment.bestIgt !== null
			&& segment.bestIgt.asMilliseconds() === segAttempt.igt.asMilliseconds();
		segAttempt.isPb = segment.pbIgt !== null
			&& segment.pbIgt.asMilliseconds() === segAttempt.igt.asMilliseconds();
	} else {
		segAttempt.isBest = segment.bestRta !== null
			&& segAttempt.rta.asMilliseconds() === segment.bestRta.asMilliseconds();
		segAttempt.isPb = segment.pbRta !== null
			&& segment.pbRta.asMilliseconds() === segAttempt.rta.asMilliseconds();
	}

	return segAttempt;
};

SegmentAttempt.prototype.ToRun = function() {
	var run = new Run();

	var timeUntilSeg = this.TimeUntil();
	if (timeUntilSeg === null)
		return null;

	run.started = this.attempt.started.clone().add(timeUntilSeg);
	run.ended = run.started.clone().add(this.rta);
	run.isStartedSynced = this.attempt.isStartedSynced;
	run.isEndedSynced = this.attempt.isEndedSynced;
	run.rta = this.rta;
	run.igt = this.igt;

	return run;
};

SegmentAttempt.prototype.TimeUntil = function() {
	var root = this.segment.historyElem.closest("Run");
	var time = null;

	var segAttempt = this;
	root.find("Segments").children("Segment").each(function() {
		var elem = $(this);

		var timeElem = elem.children("SegmentHistory").children('#' + segAttempt.attempt.id);
		if (timeElem.length <= 0 || timeElem.children("RealTime").length <= 0)
			return;

		if (time === null)
			time = moment.duration(0);
		if (elem.children("Name").text() === segAttempt.segment.name)
			return false;
		time.add(moment.duration(timeElem.children("RealTime").text()));
	});
	return time;
};


/*
* RunHighlighter object
*/
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
	}
};
