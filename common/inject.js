(function() {
	function inject() {
		if ($('body').attr("run-highlighter-injected") === "true")
			return;

		console.log("Run Highlighter: injecting");

		function injectScript(src, callback) {
			var s = document.createElement('script');
			s.src = getResourceURL(src);
			s.async = true;
			s.onload = function() { this.parentNode.removeChild(this) };
			if (callback) {
				s.onreadystatechange = s.onload = function() {
					if (!callback.done && (!s.readyState || /loaded|complete/.test(s.readyState))) {
						callback.done = true;
						callback();
					}
				};
			}
			document.querySelector('head').appendChild(s);
		}

		$('body').attr("run-highlighter-injected", "true");
		var container = $('<div id="run-highlighter"></div>');
		getResource("run-highlighter.html", function(data) {
			container.html(data);
			$('body').append(container);
			injectScript("lib/moment.js", function() {
				injectScript("run-highlighter-obj.js", function() {
					injectScript("run-highlighter.js");
				});
			});
		});
	}

	var currentUrl = null;
	setInterval(function() {
		if (window.location.href === currentUrl)
			return;
		currentUrl = window.location.href;

		if (/^\/[^\/]+\/manager\/[^\/]+\/highlight\/?$/.test(window.location.pathname)) {
			waitForKeyElements("form.highlight-form fieldset h4:eq(0)", function() {
				var link = $('<a class="open-run-highlighter" href="javascript: void(0);">use Run Highlighter</a>');
				$("form.highlight-form fieldset h4:eq(0)").append("<br/>or ").append(link);
				link.click(function() {
					$("#run-highlighter > div").show();
				});
				inject();
			});
		} else if (/^\/[^\/]+\/manager\/(past_broadcasts|highlights)\/?$/.test(window.location.pathname)
			|| /^\/[^\/]+(\/profile(\/[^\/]+)?)?\/?$/.test(window.location.pathname)) {
			waitForKeyElements("div .directory_header li:eq(1)", function() {
				var link = $('<li><a href="javascript: void(0);">Run Highlighter</a></li>');
				$("div .directory_header li:eq(1)").after(link);
				link.click(function() {
					$("#run-highlighter > div").show();
				});
				inject();
			});
		}
	}, 1000);
})();
