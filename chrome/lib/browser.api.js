function getResourceURL(url) {
	return chrome.extension.getURL(url);
}

function getResource(file, callback) {
	$.get(getResourceURL(file), function(data) {
		callback(data);
	});
}
