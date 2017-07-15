(function(){
	if (typeof(Storage) === "undefined") {
		$("#settings-link").hide();
		return;
	}

	$('#settings-link').click(function(e) {
		e.preventDefault();
		toggleSettings(300);
	});

	function toggleSettings(duration){
		var elem = $("#settings-link");

		var fadeIn = { opacity: 1, transition: 'opacity ' + duration/2 +'ms' };
		var fadeOut = { opacity: 0, transition: 'opacity ' + duration +'ms' };

		if (elem.attr("href") === "#settings") {
			history.replaceState("", document.title, window.location.pathname
				+ "#settings");

			elem.attr("href", "javascript:void(0)");
			elem.html("&#9667;Back");

			$("#settings-container").css(fadeIn).slideDown(duration);
			$("#main-body").css(fadeOut).slideUp(duration);

			updatePreviews();
		} else {
			elem.attr("href", "#settings");
			elem.html("Settings");

			//remove hash
			history.replaceState("", document.title, window.location.pathname + window.location.search);

			$("#settings-container").css(fadeOut).slideUp(duration);
			$("#main-body").css(fadeIn).slideDown(duration);
		}
	}

	var inputBuffer = $("input[name=setting-buffer]");
	var inputTitleRun = $("input[name=setting-title-format-full-run]");
	var inputTitleSegment = $("input[name=setting-title-format-segment]");
	var inputDescription = $("textarea[name=setting-description]");
	var inputTruncated = $("input[name=setting-truncated]");

	// defaults in placeholder
	inputBuffer.attr("placeholder", RunHighlighter.settings._buffer_default);
	inputTitleRun.attr("placeholder", RunHighlighter.settings._fullRunTitle_default);
	inputTitleSegment.attr("placeholder", RunHighlighter.settings._segmentTitle_default);
	inputDescription.attr("placeholder", RunHighlighter.settings._description_default);

	inputBuffer.val(localStorage.getItem("buffer"));
	inputTitleRun.val(localStorage.getItem("full-run-title-format"));
	inputTitleSegment.val(localStorage.getItem("segment-title-format"));
	inputDescription.val(localStorage.getItem("description-format"));
	inputTruncated.filter("input[value=false]").prop('checked', !RunHighlighter.settings.truncate);
	inputTruncated.filter("input[value=true]").prop('checked', RunHighlighter.settings.truncate);

	inputBuffer.on('input', function(e) {
		var value = $(this).val().trim();
		RunHighlighter.settings._set_int_item("buffer", "buffer", value);
		RunHighlighter.settings.load();
		if (e.originalEvent && typeof window.formatChanged === "function")
			window.formatChanged();
	});

	function updatePreviews() {
		inputTitleRun.trigger('input');
		inputTitleSegment.trigger('input');
		inputDescription.trigger('input');
	}

	function updatePreview(raw, previewElem, type) {
		if (!type)
			type = "segment";

		var selectedRun = components.search.getSelectedRun(type);
		if (!selectedRun && type !== "run")
			selectedRun = components.search.getSelectedRun("run");

		if (!selectedRun) {
			selectedRun = new Run();
			selectedRun.type = "segment";
			selectedRun.segmentName = "Level 1";
			selectedRun.gameName = "Zelda"
			selectedRun.categoryName = "Any%";
			selectedRun.rta = moment.duration(100714);
			selectedRun.igt = moment.duration(94737);
			selectedRun.isStartedSynced = true;
			selectedRun.isEndedSynced = true;
			selectedRun.ended = moment();
			selectedRun.started = selectedRun.ended.clone().subtract(selectedRun.rta);
		}

		if (selectedRun.type === "run") {
			selectedRun.segmentName = window.segments && window.segments.length > 0 && window.segments[0].name
				? window.segments[0].name
				: "<Segment Name>";
		}

		previewElem.text(RunHighlighter.formatText(raw, selectedRun));
	}

	inputTitleRun.on('input', function(e) {
		var value = $(this).val().trim();
		RunHighlighter.settings._set_item("fullRunTitle", "full-run-title-format", value);
		RunHighlighter.settings.load();
		updatePreview(RunHighlighter.settings.fullRunTitle, $("#setting-title-format-full-run-preview"), "run");
		if (e.originalEvent && typeof window.formatChanged === "function")
			window.formatChanged();
	});

	inputTitleSegment.on('input', function(e) {
		var value = $(this).val().trim();
		RunHighlighter.settings._set_item("segmentTitle", "segment-title-format", value);
		RunHighlighter.settings.load();
		updatePreview(RunHighlighter.settings.segmentTitle, $("#setting-title-format-segment-preview"));
		if (e.originalEvent && typeof window.formatChanged === "function")
			window.formatChanged();
	});

	inputDescription.on('input', function(e) {
		var value = $(this).val().trim();
		RunHighlighter.settings._set_item("description", "description-format", value);
		RunHighlighter.settings.load();
		updatePreview(RunHighlighter.settings.description, $("#setting-description-format-preview"));
		if (e.originalEvent && typeof window.formatChanged === "function")
			window.formatChanged();
	});

	inputTruncated.on('change', function(e) {
		var value = $(this).val() === "true";
		RunHighlighter.settings._set_bool_item("truncate", "truncate", value);
		RunHighlighter.settings.load();
		updatePreviews();
		if (e.originalEvent && typeof window.formatChanged === "function")
			window.formatChanged();
	});

	if (window.location.hash == "#settings")
		toggleSettings(0);
})();
