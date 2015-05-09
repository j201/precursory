var mori = require('mori');
var precursory = require('./lib');

function enter(data, key) {
	return mori.isAssociative(data) ?
		mori.get(data, key) :
		mori.nth(data, key);
}

function set(data, key, val) {
	return mori.isAssociative(data) ?
		mori.assoc(data, key, val) :
		mori.concat(mori.take(key, data), mori.cons(val, mori.drop(key+1, data)));
}

module.exports = precursory({
	get: function(data, entries) {
		return entries.reduce(enter, data);
	},
	set: function setIn(data, entries, newVal) {
		return set(data, entries[0], entries.length > 1 ?
			setIn(enter(data, entries[0]), entries.slice(1), newVal) :
			newVal);
	}
});
