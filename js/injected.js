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

	function waitForKeyElements(selector, callback, delay) {
		if (!selector)
			throw "Undefined selector argument";
		if (!callback)
			throw "Undefined callback argument";

		if (delay === undefined)
			delay = 200;

		var element = document.querySelector(selector);
		if (element)
		{
			callback();
		}
		else
		{
			setTimeout(function() {
				waitForKeyElements(selector, callback, delay);
			}, delay);
		}
	}

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
				this._waitForPageLoad(function() { self._onPageLoaded(); });
			}
		},

		hasRunHighlighterArgs: function() {
			return this.title !== null || this.description !== null
				|| !isNaN(this.start_time) || !isNaN(this.end_time);
		},

		_waitForPageLoad: function(callback, delay) {
			if (!callback)
				throw "Undefined callback argument";

			if (delay === undefined)
				delay = 125;

			waitForKeyElements(this.rootSelector, callback, delay);
		},

		_onPageLoaded: function() {
			this.overwriteVideoQueue();
			if (this.AreStartAndEndSet())
				this.openDescriptionPopup();
		},

		AreStartAndEndSet: function() {
			return !isNaN(this.start_time) && !isNaN(this.end_time);
		},

		overwriteVideoQueue: function() {
			Logger.log("Overwriting first video segment");

			var mainComponent = this._getMainComponent();

			var queue = mainComponent.state.videoSegmentQueue;
			var segment = queue[queue.length - 1];
			this._setSegmentMetadata(segment);
			this._setSegmentOffsets(segment);

			mainComponent.setState({
				videoSegmentQueue: [
					segment
				]
			});
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

		_setSegmentOffsets: function(segment) {
			if (!isNaN(this.start_time))
				segment.startOffsetSeconds = this.start_time;

			if (!isNaN(this.end_time))
				segment.endOffsetSeconds = this.end_time;
		},

		_setPlayerOffset: function() {
			Logger.log("Setting video player offset");

			var mainComponent = this._getMainComponent();
			mainComponent.setState({ requestedPlayerOffset: this.start_time });
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
	};

	var getChannel = function() {
		return window.location.pathname.split("/")[1];
	}

	var getRhUrl = function() {
		return "https://dalet.github.io/run-highlighter/?channel=" + getChannel();
	};

	var pageAction = function() {
		if (/^\/[^\/]+\/manager\/highlighter\/[^\/]+\/?$/.test(window.location.pathname)) {
			highlighterPageAction();
		}/* else if (/^\/[^\/]+\/manager\/(past_broadcasts|highlights|uploads|collections)\/?$/.test(window.location.pathname)) {
			waitForKeyElements("div .directory_header li:eq(1)", function() {
				var link = $('<li class="tw-tabs__item"><a href="' + getRhUrl() +'">Run Highlighter</a></li>');
				$("div .directory_header li:last()").after(link);
			});
		} else if (/^\/[^\/]+\/videos\/[^\/]+$/.test(window.location.pathname)) {
			var blacklist = ["settings", "directory"];
			if (blacklist.indexOf(getChannel()) < 0) {
				waitForKeyElements("div.filter-bar .filter-bar__left", function() {
					var link = $('<div class="run-highlighter-link" style="display: flex; align-items: center;">'
						+ '<a href="' + getRhUrl() +'">Run Highlighter</a></div>');
					$("div.filter-bar .filter-bar__left:last()").append(link);
				});
			}
		}*/
	};

	var highlighterPageAction = function() {
		Highlighter.start();
	};

	var init = function() {
		var currentUrl = null;
		setInterval(function() {
			if (window.location.href === currentUrl)
				return;
			currentUrl = window.location.href;
			pageAction();
		}, 750);
	};

	if (/(www\.)?twitch\.tv$/.test(window.location.hostname))
		init();
})();
