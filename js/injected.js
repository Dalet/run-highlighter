(function() {
	var Logger = {
		prefix: "Run Highlighter: ",

		log: function(message) {
			console.log(this.formatMsg(message));
		},

		error: function(message) {
			console.error(this.formatMsg(message));
		},

		formatMsg: function (message) {
			return this.prefix + message;
		}
	};

	if (document.body.hasAttribute("run-highlighter-addon"))
	{
		Logger.error("already injected");
		return;
	}

	document.body.setAttribute("run-highlighter-addon", "");
	Logger.log("injected");

	/*
		React helper
	*/
	var ReactHelper = {
		getInstance: function(elem) {
			for (var key in elem) {
				if (key.startsWith('__reactInternalInstance$')) {
					return elem[key];
				}
			}
		},

		searchParent: function(instance, predicate) {
			if (instance._reactInternalFiber)
				instance = instance._reactInternalFiber;

			var parent = instance.return;

			if (!parent)
				return null;
			else if (predicate(parent))
				return parent;

			return this.searchParent(parent, predicate);
		},

		searchChildren: function(instance, predicate) {
			if (instance._reactInternalFiber)
				instance = instance._reactInternalFiber;

			var target = null;
			var self = this;
			this.getChildren(instance).some(function(child) {
				if (predicate(child))
				{
					target = child;
					return true;
				}

				var result = self.searchChildren(child, predicate);
				if (result)
				{
					target = result;
					return true;
				}
			});

			return target;
		},

		getChildren: function(node){
			if (node._reactInternalFiber)
				node = node._reactInternalFiber;
			else if (node instanceof Node)
				node = this.getInstance(node);

			if (!node)
				return null;

			const children = [];
			let child = node.child;
			while (child) {
				children.push(child);
				child = child.sibling;
			}

			return children;
		}
	};

	/*
	* Highlighter object
	*/
	var Highlighter = {
		rootSelector: ".highlighter-page",
		messageBoxClassName : "run-highlighter-loading-msg",

		getMessageBox: function() {
			return document.querySelector("." + this.messageBoxClassName);
		},

		start: function() {
			var urlVars = this._getUrlVars();
			this.start_time = parseInt(urlVars.start_time);
			this.end_time = parseInt(urlVars.end_time);
			this.automate = urlVars.automate === "true" || parseInt(urlVars.automate) === 1;
			this.title = null;
			this.description = null;
			this._player = null;

			if (urlVars.title !== undefined && urlVars.title.length > 0) {
				try {
					this.title = window.atob(decodeURIComponent(urlVars.title));
				} catch (e) { this.title = null; }
			}

			if (urlVars.desc !== undefined && urlVars.desc.length > 0) {
				try {
					this.description = window.atob(decodeURIComponent(urlVars.desc));
				} catch (e) { this.description = null; }
			}

			if (this.hasRunHighlighterArgs()) {
				var self = this;
				this._waitForPageLoad(function() { self._onPageLoaded(); }, 0);
			}
		},

		hasRunHighlighterArgs: function() {
			return this.title !== null || this.description !== null
				|| !isNaN(this.start_time) || !isNaN(this.end_time);
		},


		_waitForPageLoad: function(callback, delay) {
			if (!callback)
				throw "Undefined callback argument";
			var self = this;
			setTimeout(function() {
				var highlighterRoot = document.querySelector(self.rootSelector);
				if (highlighterRoot)
					callback();
				else
					self._waitForPageLoad(callback);
			}, delay !== undefined ? delay : 75);
		},

		_onPageLoaded: function() {
			if (this.shouldFillForm())
				this._installSelectHighlightHook();

			this._setTimeline();
			//this._setPlayerOffset();

			if (this.shouldAddSegment()) {
				this._addSegment();
				this.openDescriptionPopup();
			}
		},

		shouldAddSegment: function() {
			return !isNaN(this.start_time) && !isNaN(this.end_time);
		},

		shouldFillForm: function() {
			return this.title !== null || this.description !== null;
		},

		_installSelectHighlightHook: function() {
			var timelineComponent = this._getTimelinePickerComponent();
			if (!timelineComponent)
				Logger.error("Couldn't install OnSelectSegmentClick hook");

			var self = this;
			timelineComponent.__onSelectSegmentClick_original = timelineComponent.onSelectSegmentClick;
			timelineComponent.onSelectSegmentClick = function() {
				timelineComponent.__onSelectSegmentClick_original();
				self._onSelectSegmentClicked();
			};
		},

		_onSelectSegmentClicked: function() {
			var mainComponent = this._getMainComponent();

			var self = this;
			mainComponent.setState({}, function() {
				var queue = mainComponent.state.videoSegmentQueue;
				var segment = queue[queue.length - 1];
				self._setSegmentMetadata(segment);
			});
		},

		_setSegmentMetadata: function(segment) {
			var metadata = segment.metadata;

			if (this.title !== null)
				metadata.title = this.title;
			if (this.description !== null)
				metadata.description = this.description;

			metadata.tags = metadata.tags.slice();
			metadata.tags.push("speedrun");
			metadata.tags.push("speedrunning");
		},

		_setPlayerOffset: function() {
			Logger.log("Setting video player offset");

			var mainComponent = this._getMainComponent();
			mainComponent.setState({ requestedPlayerOffset: this.start_time });
		},

		_setTimeline: function() {
			Logger.log("Setting timeline");

			var timeline = this._getTimelinePickerComponent();
			if (!timeline) {
				Logger.error("Couldn't find the timeline component");
				return;
			}

			var state = timeline.state;
			var segment = state.timelineSegments[0];
			if (!isNaN(this.start_time))
				segment.startOffset = this.start_time;
			if (!isNaN(this.end_time))
				segment.endOffset = this.end_time;
		},

		_addSegment: function() {
			Logger.log("Adding video segment");

			var comp = this._getTimelinePickerComponent();
			if (!comp) {
				Logger.error("Couldn't add the video segment.");
				return;
			}

			var currentSeg = {
				startOffset: this.start_time,
				endOffset: this.end_time
			};

			// add the segment
			comp.onSelectSegmentClick(currentSeg);
		},

		openDescriptionPopup: function() {
			Logger.log("Opening description modal");

			var btn = this._getDescribeBtnComponent();
			if (!btn) {
				Logger.error("Couldn't open the description modal");
				return;
			}

			btn.props.onClick();
		},

		_getMainComponent: function() {
			if (this._mainComponent)
				return this._mainComponent;

			var elem = document.querySelector(this.rootSelector);
			var elemInstance = ReactHelper.getInstance(elem);
			var fiber = ReactHelper.searchParent(elemInstance, function(target) {
				var state = target.stateNode && target.stateNode.state;
				return state && state.videoSegmentQueue;
			});

			if (!fiber) {
				Logger.error("Couldn't find the main component");
				return null;
			}

			this._mainComponent = fiber.stateNode;
			return this._mainComponent;
		},

		_getTimelinePickerComponent: function() {
			if (this._timelinePickerComponent)
			return this._timelinePickerComponent;

			var fiber =	ReactHelper.searchChildren(this._getMainComponent(), function(e) {
				return e.stateNode && e.stateNode.state
				&& e.stateNode.state.timelineSegments;
			});

			if (!fiber)
			{
				Logger.error("Couldn't find the timeline component");
				return null;
			}

			return this._timelinePickerComponent = fiber.stateNode;
		},

		_getDescribeBtnComponent: function() {
			if (this._describeBtnComponent)
				return this._describeBtnComponent;

			var queueFiber = ReactHelper.searchChildren(this._getMainComponent(), function(e) {
				return e.stateNode && e.stateNode.props && e.stateNode.props.onSaveClick;
			});

			var fiber = ReactHelper.searchChildren(queueFiber, function(e) {
				var props = e.stateNode && e.stateNode.props;
				return props && props.onClick && props.fullWidth;
			});

			if (!fiber) {
				Logger.error("Couldn't find the \"Describe and Save\" button");
				return null;
			}

			this._describeBtnComponent = fiber.stateNode;
			return this._describeBtnComponent;
		},


		_getUrlVars: function() {
			var vars = {};
			var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
				vars[key] = value;
			});
			return vars;
		},

		addMessageBox: function() {
			msg = '<div class="' + this.messageBoxClassName +'" style="'
				+ 'border: 1px solid rgba(60,60,60,1);' //#4e4e4e
				+ 'padding: 10px;'
				+ 'margin-bottom: 10px;'
				+ 'background: rgba(255, 255, 255, 0.07);'
				+ 'box-shadow: rgba(100,65,164,0.75) 0 0 10px;'
				+ '">'
				+ '<h4 style="text-align: center; margin-bottom: 5px;">Please wait...</h4>'
				+ '<p style="font-size: 13px; margin-bottom: 3px;">Run Highlighter is waiting for the player to load.</p>'
				+ '<p style="text-align: right;">seems broken?'
				+ ' <a href="https://goo.gl/forms/2lyRNy0tl03rqlt82">contact me</a></p>'
				+ '</div>';
			if (this.hasRunHighlighterArgs) {
				$(this.rootSelector).prepend(msg);
			}
		}
	};

	var getChannel = function() {
		return window.location.pathname.split("/")[1];
	}

	var getRhUrl = function() {
		return "https://dalet.github.io/run-highlighter/?channel=" + getChannel();
	};

	var onReady = function() {
		var currentUrl = null;
		setInterval(function() {
			if (window.location.href === currentUrl)
				return;
			currentUrl = window.location.href;
			pageAction();
		}, 750);
	};

	var pageAction = function() {
		if (/^\/[^\/]+\/manager\/highlighter\/[^\/]+\/?$/.test(window.location.pathname)) {
			highlighterPageAction();
		} else if (/^\/[^\/]+\/manager\/(past_broadcasts|highlights|uploads|collections)\/?$/.test(window.location.pathname)) {
			waitForKeyElements("div .directory_header li:eq(1)", function() {
				var link = $('<li class="tw-tabs__item"><a href="' + getRhUrl() +'">Run Highlighter</a></li>');
				$("div .directory_header li:last()").after(link);
			}, true);
		} else if (/^\/[^\/]+\/videos\/[^\/]+$/.test(window.location.pathname)) {
			var blacklist = ["settings", "directory"];
			if (blacklist.indexOf(getChannel()) < 0) {
				waitForKeyElements("div.filter-bar .filter-bar__left", function() {
					var link = $('<div class="run-highlighter-link" style="display: flex; align-items: center;">'
						+ '<a href="' + getRhUrl() +'">Run Highlighter</a></div>');
					$("div.filter-bar .filter-bar__left:last()").append(link);
				}, true);
			}
		}
	};

	var highlighterPageAction = function() {
		Highlighter.start();
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
	};

	if (!/(www\.)?twitch\.tv$/.test(window.location.hostname))
		return;

	inject("https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js", function() {
		inject("https://dalet.github.io/run-highlighter/js/waitForKeyElements.js", onReady);
	});
})();
