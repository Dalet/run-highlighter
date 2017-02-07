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

		var seg = type === "run" ? getSelectedRun("run") : getSelectedRun("segment");

		if (type !== "run" && !seg)
			seg = getSelectedRun("run");

		var runExample = new Run();
		if (seg) {
			runExample.type = seg.type;
			runExample.segmentName = seg.segmentName;
			runExample.gameName = seg.gameName;
			runExample.categoryName = seg.categoryName;
			runExample.rta = seg.rta;
			runExample.igt = seg.igt;
		} else {
			runExample.type = "segment";
			runExample.segmentName = "Level 1";
			runExample.gameName = "Zelda"
			runExample.categoryName = "Any%";
			runExample.rta = moment.duration(100714);
			runExample.igt = moment.duration(94737);
		}

		if (runExample.type === "run") {
			runExample.segmentName = window.segments && window.segments.length > 0 && window.segments[0].name
				? window.segments[0].name
				: "<Segment Name>";
		}

		runExample.type = type ? type : "segment";

		previewElem.text(RunHighlighter.formatText(raw, runExample));
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