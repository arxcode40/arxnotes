"use strict";

class LocalDB {
	constructor(collection) {
		this.collection = collection;

		if (localStorage.getItem(this.collection)) {
			localStorage.setItem(this.collection, JSON.stringify([]));
		}
	}

	find(where = null) {
		const data = JSON.parse(localStorage.getItem(this.collection));

		if (where === null) {
			return data;
		}

		return data[where];
	}

	insert(set) {
		const data = this.find();

		data.push(set);

		localStorage.setItem(this.collection, JSON.stringify(data));

		return this;
	}

	update(set, where) {
		let data = this.find();

		data[where] = set;

		localStorage.setItem(this.collection, JSON.stringify(data));

		return this;
	}

	delete(where) {
		const data = this.find();

		data.splice(where, 1);
		
		localStorage.setItem(this.collection, JSON.stringify(data));

		return this;
	}
}