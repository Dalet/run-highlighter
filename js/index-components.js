"use strict";
class Component {
	/** @param {HTMLElement} element */
	constructor(element) {
		/**
		 * Linked element
		 * @type {HTMLElement}
		 */
		this.element = element;

		/**
		 * Linked jQuery element
		 * @type {jQuery}
		 */
		this.jElement = $(element);

		var self = this;
		this.element.addEventListener("change", function (e) {
			self._onChange(e);
			if (typeof (self.onChange) == "function")
				self.onChange(e);
		});

		/** @type {function} */
		this.onChange = null;
	}

	/** Delete the underlying HTML element */
	removeElement() {
		this.element.parentElement.removeChild(this.element);
	}

	_onChange(e) { }
}

class Selector extends Component {
	/**
	 * @param {HTMLSelectElement} selectElement
	 * @param {HTMLElement} infoElem
	 */
	constructor(selectElement, infoElem) {
		super(selectElement || RunSelector.makeElement());

		/** @type {Array} */
		this._items = [];

		/** @type {HTMLElement} */
		this.infoElem = infoElem || null;
	}

	/** @type {Array} */
	set items(val) {
		this._items = val;
		this.buildOptionList();
		this.updateInfoString();
	}
	get items() { return this._items; }

	/** @type {String} */
	set infoString(val) {
		if (!this.infoElem) return;
		this.infoElem.innerHTML = val;
	}

	get infoString() {
		if (!this.infoElem) return null;
		return this.infoElem.innerHTML;
	}

	get selectedItem() {
		if (this.isEmpty())
			return null;
		return this.items[this.element.selectedIndex];
	}

	/** @return {HTMLSelectElement} */
	static makeElement() {
		var elem = document.createElement("select");
		elem.className = "selectpicker form-control";
		return elem;
	}

	/** Empty the item list */
	empty() {
		this.items = [];
	}

	/** @returns {boolean} */
	isEmpty() {
		return !this.items || this.items.length == 0;
	}

	/** Called to rebuild the select's <option> list */
	buildOptionList() {
		this.jElement.empty();
		this.infoString = "";
	}

	/**
	 * Called when the selection index changes
	 * @param {Event} e
	 */
	_onChange(e) {
		super._onChange(e);
		this.infoString = "";
	}

	/** @virtual */
	updateInfoString() { }
}

class RunSelector extends Selector {
	/**
	 * @param {HTMLSelectElement} selectElement
	 * @param {HTMLElement} infoElem
	 */
	constructor(selectElement, infoElem) {
		super(selectElement, infoElem);
		this.maxHistory = 50;
	}

	buildOptionList() {
		super.buildOptionList();

		if (this.isEmpty()) {
			this.jElement.selectpicker("hide");
			return;
		}

		//add complete runs to the combobox
		var fragment = document.createDocumentFragment()
		this.items.forEach(function (run, i) {
			var option = document.createElement("option");

			if (run.isStartedSynced === false || run.isEndedSynced === false) {
				$(option).addClass("bg-warning");
			}
			var useIgt = run.igt !== null;

			var timeStr = RunHighlighter._format_time(run.rta.asSeconds(), 2) + " RTA";
			if (run.igt !== null) {
				timeStr = RunHighlighter._format_time(run.igt.asSeconds(), 2) + " IGT / " + timeStr;
			}

			option.setAttribute("data-subtext", "#" + run.id);
			option.textContent = timeStr + ", " + run.ended.from(moment.utc());
			fragment.appendChild(option);
		});

		this.element.appendChild(fragment);
		this.jElement.selectpicker("show");
		this.jElement.selectpicker("refresh");
	}

	_onChange(e) {
		super._onChange(e);

		components.search.cancel();
		this.updateInfoString();
	}

	updateInfoString() {
		if (this.isEmpty()) {
			this.infoString = "No highlightable run was found.";
			return;
		}

		var run = this.selectedItem;
		if (run != null
			&& (run.isStartedSynced == false || run.isEndedSynced == false)) {
			this.infoString = "This run might not be found precisely.";
		}
	}
};

class SegmentSelector extends Selector {
	/**
	 * @param {HTMLSelectElement} selectElement
	 * @param {HTMLElement} infoElem
	 * @param {SegmentAttemptSelector} segmentAttemptSelector
	 */
	constructor(selectElement, infoElem, segmentAttemptSelector) {
		super(selectElement, infoElem);
		this.segmentAttemptSelector = segmentAttemptSelector;
	}

	buildOptionList() {
		super.buildOptionList();


		if (this.isEmpty()) {
			this.jElement.selectpicker("hide");
			this.segmentAttemptSelector.segment = null;
			return;
		}

		var fragment = document.createDocumentFragment();
		//add segment names to the combobox
		this.items.forEach(function (seg, i) {
			var option = document.createElement("option");
			var name = seg.name.trim();
			option.textContent = (i + 1) + ": " + name;
			if (name == "")
				option.setAttribute("data-content", option.textContent + '<span class="text-muted">no name</span>');
			fragment.appendChild(option);
		});

		this.element.appendChild(fragment);
		this.jElement.selectpicker("show");
		this.jElement.selectpicker("refresh");

		this.segmentAttemptSelector.segment = this.selectedItem
	}

	_onChange(e) {
		super._onChange(e);

		components.search.cancel();
		this.segmentAttemptSelector.segment = this.selectedItem;
	}

	updateInfoString() {
		if (this.isEmpty()) {
			this.infoString = "No segments.";
		}
	}
}

class SegmentAttemptSelector extends Selector {

	/**
	 * @param {HTMLSelectElement} selectElement
	 * @param {HTMLElement} infoElem
	 */
	constructor(selectElement, infoElem) {
		super(selectElement, infoElem);
		this._segment = null;
		/** @type {!number} */
		this.maxHistory = 50;
	}

	/** @type {Segment} */
	set segment(val) {
		this._segment = val;
		this.items = val ? val.getHistory(this.maxHistory) : null;
	}
	get segment() { return this._segment; }

	buildOptionList() {
		super.buildOptionList();

		if (this.isEmpty()) {
			this.jElement.selectpicker("hide");
			return;
		}

		var fragment = document.createDocumentFragment();
		this.items.forEach(function (seg, i) {
			var run = seg.ToRun();
			if (!run)
				return;

			var option = document.createElement("option");

			var timeStr = RunHighlighter._format_time(seg.rta.asSeconds(), 2) + " RTA";
			if (seg.igt)
				timeStr = RunHighlighter._format_time(seg.igt.asSeconds(), 2) + " IGT / " + timeStr;

			if (seg.attempt.isStartedSynced === false || seg.attempt.isEndedSynced === false)
				$(option).addClass("bg-warning");

			if (seg.isBest)
				option.setAttribute("data-icon", "glyphicon-star");

			option.textContent = timeStr + ", " + run.ended.from(moment.utc());
			option.setAttribute("data-subtext", "#" + seg.attempt.id + (seg.isPb ? " (PB)" : ""));
			fragment.appendChild(option);
		});
		this.element.appendChild(fragment);

		this.jElement.selectpicker("refresh");
		this.jElement.selectpicker("show");
	}

	_onChange(e) {
		super._onChange(e);

		components.search.cancel();
		this.updateInfoString();
	}

	updateInfoString() {
		if (this.isEmpty()) {
			this.infoString = "No highlightable segment was found.";
			return;
		}

		var run = this.selectedItem.ToRun();
		if (run !== null) {
			if (run.isStartedSynced === false || run.isEndedSynced === false) {
				this.infoString = "This segment might not be found precisely.";
			}
		}
	}
}

class FileInput extends Component {
	/** @param {HTMLInputElement} inputElement */
	constructor(inputElement) {
		super(inputElement);
		/**
		 * File content
		 * @type {string}
		 */
		this.fileContent = null;
	}

	loadFile(callback) {
		if (this.element.files.length <= 0)
			return;

		var file = this.element.files[0];
		var self = this;
		var fr = new FileReader();
		fr.onloadend = function (event) {
			self.fileContent = event.target.result;
			if (callback)
				callback(self);
		};
		fr.readAsText(file);
	}
}

class MessageDisplay extends Component {
	setAlertClass(val) {
		var className = val
			? " " + val.trim()
			: "";
		this.element.className = "alert" + className;
	}

	setMessage(innerHTML, alertClass) {
		if (!innerHTML || innerHTML.length == 0) {
			this.jElement.hide();
		}
		this.element.innerHTML = innerHTML || "";
		this.setAlertClass(alertClass);
		this.jElement.slideDown(100, "swing");
	}
}
