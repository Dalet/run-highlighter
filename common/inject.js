(function() {
	if (document.body.hasAttribute("run-highlighter-addon"))
		return;
	var s = document.createElement('script');
	s.src = "https://dalet.github.io/run-highlighter/js/injected.js";
	s.async = true;
	s.onload = function() { this.parentNode.removeChild(this); };
	document.head.appendChild(s);
})();
