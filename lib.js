var toArr = Function.prototype.call.bind(Array.prototype.slice);

// Spec input:
// get :: (TData, TEnter[]) => TValue
// set :: (TData, TEnter[], TValue) => TData

// Cursor methods:
// enter :: TEnter => TCursor
// get :: () => TValue
// set :: TValue => void
// onChange :: (TData => void) => void
var precursor = function(spec) {
	return function(store) {
		function cursor(entries, listeners) {
			var getCached = false;
			var getCache;

			var self = {
				enter: function() {
					return cursor(entries.concat(toArr(arguments)), listeners);
				},
				get: function() {
					if (getCached) return getCache;
					getCached = true;
					getCache = spec.get(store, entries);
					return getCache;
				},
				set: function(val) {
					if (getCached && val === getCache) return; // TODO: more rigorous equality? maybe in the spec?
					getCached = false;
					store = spec.set(store, entries, val);
					listeners.forEach(function(listener) {
						listener(cursor([], listeners));
					});
				},
				transact: function(f) {
					self.set(f(self.get()));
				},
				// Doing things like cortex for simplicity for now, but really, the user shouldn't have to worry about using this
				onChange: function(listener) {
					listeners.push(listener);
				}
			};

			return self;
		}

		return cursor([], []);
	};
};

module.exports = precursor;
