function getResourceURL(file) {
	return self.options.paths[file];
}

function getResource(file, callback) {
	callback(self.options.filesContent[file]);
}
