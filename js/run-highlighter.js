/*
* Run class
*/
var Run = function(type) {
	this.type = type !== undefined && type !== null ? type : "run";
	this.started = null;
	this.ended = null;
	this.isStartedSynced = null;
	this.isEndedSynced = null;
	this.rta = null;
	this.igt = null;
	this.gameName = null;
	this.categoryName = null;
	this.segmentName = null;
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

	run.gameName = elem.closest("Run").children("GameName").text().trim();
	run.categoryName = elem.closest("Run").children("CategoryName").text().trim();

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

Run.prototype.getTitle = function() {
	var useIgt =  this.igt !== null;
	var time = useIgt ? this.igt : this.rta;
	var timeStr = RunHighlighter._format_time(time.asSeconds());
	if (useIgt)
		timeStr += " IGT (" + RunHighlighter._format_time(this.rta.asSeconds()) + " RTA)";
	var catStr = " ";

	if (this.type === "segment") {
		if (this.categoryName.length > 0)
			catStr = " (" + this.categoryName + ") ";
		return this.gameName + catStr + "- " + this.segmentName + " in " + timeStr;
	} else {
		if (this.categoryName.length > 0)
			catStr = " " + this.categoryName + " ";
		return this.gameName + catStr + "speedrun in " + timeStr;
	}
};


/*
* Segment class
*/
var Segment = function() {
	this.name = null;
	this.gameName = null;
	this.categoryName = null;
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
	segment.historyElem = elem.children("SegmentHistory");
	segment.gameName = segment.historyElem.closest("Run")
		.children("GameName").text().trim();
	segment.categoryName = segment.historyElem.closest("Run")
		.children("CategoryName").text().trim();
	var best = elem.children("BestSegmentTime");
	if (best.children("RealTime").length > 0)
		segment.bestRta = moment.duration(best.children("RealTime").text());
	if (best.children("GameTime").length > 0)
		segment.bestIgt = moment.duration(best.children("GameTime").text());

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
		if ($(elems[i]).children().length === 0)
			continue;

		var id = $(elems[i]).attr("id");
		var attemptElem = segment.attemptsElem.filter('#' + id);
		if (attemptElem.length === 0)
			continue;

		var attempt = Run.FromXML(attemptElem);
		var segAttempt = SegmentAttempt.FromAttempt(segment, attempt);
		if (segAttempt === null)
			continue;

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
	var run = new Run("segment");

	var timeUntilSeg = this.TimeUntil();
	if (timeUntilSeg === null)
		return null;

	run.started = this.attempt.started.clone().add(timeUntilSeg);
	run.ended = run.started.clone().add(this.rta);
	run.isStartedSynced = this.attempt.isStartedSynced;
	run.isEndedSynced = this.attempt.isEndedSynced;
	run.rta = this.rta;
	run.igt = this.igt;
	run.gameName = this.segment.gameName;
	run.categoryName = this.segment.categoryName;
	run.segmentName = this.segment.name;

	return run;
};

SegmentAttempt.prototype.TimeUntil = function() {
	var root = this.segment.historyElem.closest("Run");
	var time = null;

	var segAttempt = this;
	root.find("Segments").children("Segment").each(function() {
		var elem = $(this);

		var timeElem = elem.children("SegmentHistory").children('#' + segAttempt.attempt.id);
		if (timeElem.length <= 0 || timeElem.children("RealTime").length <= 0) {
			time = null;
			return false;
		}

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
		_buffer_default: 7,
		buffer: this._buffer_default,

		_truncate_default: false,
		truncate: this._truncate_default,

		_fullRunTitle_default: "$game $category speedrun in $gametime [ifNotIGT]RTA[/ifNotIGT][ifIGT]IGT ($realtime RTA)[/ifIGT]",
		fullRunTitle: this._fullRunTitle_default,

		_segmentTitle_default : "$game $category - $segment in $gametime [ifNotIGT]RTA[/ifNotIGT][ifIGT]IGT ($realtime RTA)[/ifIGT]",
		segmentTitle: this._segmentTitle_default,

		_description_default: "",
		description: this._description_default,

		load: function() {
			if (typeof(Storage) === "undefined")
				return;

			this._load_item("fullRunTitle", "full-run-title-format", this._fullRunTitle_default);
			this._load_item("segmentTitle", "segment-title-format", this._segmentTitle_default);
			this._load_item("description", "description-format", this._description_default);
			this._load_int_item("buffer", "buffer", this._buffer_default);
			this._load_bool_item("truncate", "truncate", this._truncate_default);
		},

		_load_item: function(key, storageKey, defaultVal) {
			if (typeof(Storage) === "undefined")
				throw "Storage is undefined";

			var value = localStorage.getItem(storageKey);

			if (value !== null && value.trim() !== "") {
				var val = value.trim();
				this[key] = val;
			} else {
				localStorage.setItem(storageKey, "");
				if (defaultVal !== undefined) {
					this[key] = defaultVal;
				}
			}
		},

		_load_int_item: function(key, storageKey, defaultVal) {
			this._load_item(key, storageKey, defaultVal);
			var val = parseInt(this[key]);
			this[key] = !isNaN(val) ? val : defaultVal;
		},

		_load_bool_item: function(key, storageKey, defaultVal) {
			this._load_item(key, storageKey, defaultVal);
			var val = this[key];
			this[key] = val.length > 0
				? val === "true"
				: defaultVal;
		},

		_set_item: function(key, storageKey, value) {
			if (typeof(Storage) === "undefined")
				throw "Storage is undefined";

			if (!value)
				value = "";

			value = value.trim();
			localStorage.setItem(storageKey, value);
			this[key] = value;
		},

		_set_int_item: function(key, storageKey, value) {
			var val = value ? String(value) : "";
			localStorage.setItem(storageKey, val);
			if (val.length > 0)
				this[key] = val;
		},

		_set_bool_item: function(key, storageKey, value) {
			var val = value ? "true" : "false";
			localStorage.setItem(storageKey, val);
			this[key] = val ? "true" : "false";
		}

	},

	_xhr: new XMLHttpRequest(),
	_lastApiCallDate: null,

	init: function() {
		this.settings.load();
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

		seconds = this.settings.truncate && decimals == 0
			? Math.floor(seconds)
			: seconds.toFixed(decimals);
		if (seconds < 10)
			seconds = "0" + seconds;
		return hours + minutes + ":" + seconds;
	},

	_twitchApiCall: function(str, callback){
		var self = this;
		var listener = function() {
			self._lastApiCallDate = Date.now();
			self._xhr.removeEventListener("loadend", listener);
			callback();
		};
		this._xhr.addEventListener("loadend", listener);

		//prevent caching
		if (str.indexOf("?") >= 0)
			str += "&random="+ new Date().getTime();
		else
			str += "?random=" + new Date().getTime();

		var url = str.indexOf("http") !== 0
			? "https://api.twitch.tv/kraken/" + str
			: str;

		var delay = 0;
		var timeSinceLastCall = Date.now() - this._lastApiCallDate;
		if (timeSinceLastCall < 1000) {
			delay = 1000 - timeSinceLastCall;
			console.log("Run Highlighter: Twitch Api call delayed by " + delay + " ms");
		}

		setTimeout(function() {
			self._xhr.open("GET", url);
			self._xhr.setRequestHeader('Client-ID', "5vm04dvyqpvledw9nknkgu1ex2tzyvs");
			self._xhr.send();
		}, delay);
	},

	searchVideo: function(vid, run){
		var vidStart = moment.utc(vid.recorded_at);
		var vidEnd = vidStart.clone().add(vid.length, 'seconds');
		if (vidStart.isSameOrBefore(run.started) && vidEnd.isSameOrAfter(run.ended)) {
			return true;
		}
		return false;
	},

	searchRun: function(channel, run, callback, progressCallback){
		var self = this;
		var videoCount = 0;
		var all_parts_found = false;

		var listener = function(event) {
			var ret = null;
			try {
				ret = JSON.parse(self._xhr.response);
			} catch(e) {}

			var requestInfo = {
				"status": self._xhr.status,
				"statusText": self._xhr.statusText,
				"response": ret
			};

			if (requestInfo.status >= 300 || !ret)
			{
				callback(null, requestInfo);
				return;
			}

			videoCount += ret.videos.length;
			console.log("Run Highlighter: retrieved " + videoCount + " out of " + ret._total + " total...");
			var video = null;
			var cancel = false;
			ret.videos.some(function(vid, i, array) {
				var part = self._getVideoPart(vid, run);
				if (part === "last" || part === "middle" || part === "first") {
					if (video === null)
						video = [vid];
					else
						video.push(vid);
					console.log("Run Highlighter: found " + part +" part, id: " + vid._id);
					all_parts_found = part === "first";
					return all_parts_found;
				} else if (part === "full") {
					video = vid;
					all_parts_found = true;
					console.log("Run Highlighter: found full matching video; id: " + vid._id);
					return true;
				} else if (moment.utc(vid.recorded_at).isBefore(run.started)) {
					//stop searching if the other videos are older than the run
					cancel = true;
					console.log("Run Highlighter: stopped searching at vid n°" + (i + 1 + videoCount - array.length));
					return true;
				}
			});

			if (video && (all_parts_found || cancel)) {
				var highlights = Array.isArray(video)
					? self._videosToHighlights(channel, video, run)
					: self._videoToHighlight(channel, video, run);
				callback(highlights, requestInfo);
			} else if (!cancel && ret._total > videoCount) {
				if (progressCallback) {
					progressCallback({
						current: videoCount,
						total: ret._total
					});
				}
				self._twitchApiCall(ret._links.next, listener);
			}
			else
				callback(null, requestInfo);
		};
		this._twitchApiCall("channels/" + channel + "/videos?broadcasts=true&limit=30", listener);
	},

	_videoToHighlight: function(channel, video, run) {
		console.log(video);
		var part = this._getVideoPart(video, run);
		var recorded_at = moment.utc(video.recorded_at);

		var start_time = 0;
		if (part === "full" || part == "first") {
			start_time = Math.floor(run.started.diff(recorded_at) / 1000);
			start_time -= this.settings.buffer;
		}

		var end_time = Math.floor(video.length);
		if (part === "full" || part === "last") {
			end_time = Math.floor(run.ended.diff(recorded_at) / 1000);
			end_time += this.settings.buffer;
		}

		if (start_time < 0) start_time = 0;
		if (end_time > Math.floor(video.length)) end_time = Math.floor(video.length);

		var duration = run.ended.diff(run.started) / 1000;
		var link = "https://www.twitch.tv/" + channel + "/manager/" + video._id + "/highlight";

		var format = run.type === "segment"
			? this.settings.segmentTitle
			: this.settings.fullRunTitle;
		var title = this.formatText(format, run);
		var description = this.formatText(this.settings.description, run);

		return {
			"run": run,
			"getTitle": function() {
				var format = this.run.type === "segment"
					? RunHighlighter.settings.segmentTitle
					: RunHighlighter.settings.fullRunTitle;
				return RunHighlighter.formatText(format, this.run);
			},
			"getDescription": function() {
				return RunHighlighter.formatText(RunHighlighter.settings.description, run);
			},
			"description": description,
			"start_time": start_time,
			"end_time": end_time,
			"link": link,
			"duration": duration,
			"part": part,
			"get_addon_link": function() {
				var tit = this.getTitle();
				tit = tit.length > 0
					? "&title=" + encodeURIComponent(window.btoa(tit))
					: "";

				var desc = this.getDescription();
				desc = desc.length > 0
					? "&desc=" + encodeURIComponent(window.btoa(desc))
					: "";

				return this.link + "?start_time=" + this.start_time
					+ "&end_time=" + this.end_time
					+ tit + desc;
			}
		};
	},

	_videosToHighlights: function (channel, videos, run) {
		var highlights = [];
		var i;
		for (i = videos.length - 1; i >= 0; --i) {
			highlights.push(this._videoToHighlight(channel, videos[i], run, i));
		}
		return highlights;
	},

	_getVideoPart: function (video, run){
		var vidStart = moment.utc(video.recorded_at);
		var vidEnd = vidStart.clone().add(video.length, 'seconds');

		if (vidStart.isSameOrBefore(run.started) && vidEnd.isSameOrAfter(run.ended))
			return "full";
		else if (vidStart.isAfter(run.started) && vidEnd.isBefore(run.ended))
			return "middle";
		else if (vidStart.isAfter(run.started) && vidStart.isBefore(run.ended)
			&& vidEnd.isSameOrAfter(run.ended))
			return "last";
		else if (vidStart.isSameOrBefore(run.started) && vidEnd.isAfter(run.started))
			return "first";
		else
			return null;
	},

	formatText: function(raw, run) {
		if (raw === undefined || raw === null)
			throw "raw param is undefined";

		if (!run)
			throw "run param is undefined";

		var useIgt = run.igt !== null && run.rta.asMilliseconds() !== run.igt.asMilliseconds()
		var ifIGTregex = /\[ifIGT\](.*?)\[\/ifIGT\]/;
		var match;
		while ((match = ifIGTregex.exec(raw)) !== null) {
			if (useIgt) {
				raw = raw.replace("[ifIGT]", "");
				raw = raw.replace("[/ifIGT]", "");
			} else
				raw = raw.replace(match[0], "");
		}

		var ifNotIGTregex = /\[ifNotIGT\](.*?)\[\/ifNotIGT\]/;
		while ((match = ifNotIGTregex.exec(raw)) !== null) {
			if (!useIgt) {
				raw = raw.replace("[ifNotIGT]", "");
				raw = raw.replace("[/ifNotIGT]", "");
			} else
				raw = raw.replace(match[0], "");
		}

		var rtStr = RunHighlighter._format_time(run.rta.asSeconds());
		var gtStr = useIgt
			? RunHighlighter._format_time(run.igt.asSeconds())
			: rtStr;

		var segmentName = run.type === "segment"
			? run.segmentName
			: "";

		var keywords = {
			"$realtime": rtStr,
			"$gametime": gtStr,
			"$game": run.gameName,
			"$category": run.categoryName,
			"$segment": segmentName,
		};

		var escapeRegExp = function(unescapedRegExp) {
			return unescapedRegExp.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		}

		for (key in keywords) {
			raw = raw.replace(new RegExp(escapeRegExp(key), 'g'), keywords[key]);
		}

		return raw;
	}
};
