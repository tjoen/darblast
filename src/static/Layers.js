function Layers() {
	var minK, maxK, selected;
	var off = {};

	var selectHandlers = new MultiSet();

	(function () {
		var first = true;
		Canvace.array.forEachLayer(function (k) {
			if (first) {
				selected = minK = maxK = k;
				first = false;
			} else {
				selected = minK = Math.min(minK, k);
				maxK = Math.max(maxK, k);
			}
		});
		if (first) {
			selected = minK = maxK = 0;
		}
	}());

	this.addAbove = function (emplace) {
		emplace(++maxK);
		selected = maxK;
		selectHandlers.fastForEach(function (handler) {
			handler(selected);
		});
	};
	this.addBelow = function (emplace) {
		emplace(--minK);
		selected = minK;
		selectHandlers.fastForEach(function (handler) {
			handler(selected);
		});
	};
	this.forEach = function (action) {
		for (var k = minK; k <= maxK; k++) {
			action(k);
		}
	};
	this.erase = function (k) {
		Canvace.array.eraseLayer(k);
		delete off[k];
		var remove = false;
		if (minK != maxK) {
			if (k == minK) {
				minK++;
				remove = true;
			} else if (k == maxK) {
				maxK--;
				remove = true;
			}
			selected = Math.min(selected, minK);
			selected = Math.max(selected, maxK);
			selectHandlers.fastForEach(function (handler) {
				handler(selected);
			});
		}
		return remove;
	};

	this.select = function (k) {
		selected = k;
		selectHandlers.fastForEach(function (handler) {
			handler(selected);
		});
	};
	this.getSelected = function () {
		return selected;
	};
	this.onSelect = selectHandlers.add;

	this.toggle = function (k, on) {
		off[k] = !on;
	};
	this.isOn = function (k) {
		return !off[k];
	};
}
