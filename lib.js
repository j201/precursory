function concat(arr, el) { return arr.concat([el]); }

// Spec input:
// get :: (TData, TEnter[]) => TValue
// set :: (TData, TEnter[], TValue) => TData

// Cursor methods:
// enter :: TEnter => TCursor
// get :: () => TValue
// set :: TValue => void
module.exports = function(get, set) {
	return function(store) {
		function cursor(entries) {
			var getCached = false;
			var getCache;
			return {
				enter: function(entry) {
					return cursor(concat(entries, entry));
				},
				get: function() {
					if (getEvaluated) return getCache;
					getCached = true;
					getCache = get(store, entries);
					return getCache;
				},
				set: function(val) {
					getCached = false;
					store = set(store, entries, val);
				}
			};
		}
	};
};
