var toArr = Function.prototype.call.bind(Array.prototype.slice);

// Spec input:
// get :: (TData, TEnter[]) => TValue
// set :: (TData, TEnter[], TValue) => TData

// Cursor as function:
// () => TValue (same as get)
// (x) => void (same as set)

// Cursor methods:
// enter :: TEnter => TCursor
// parent :: () => TCursor
// get :: () => TValue
// set :: TValue => void
// transact :: (TValue => TValue) => void
// onChange :: (TData => void) => void
var precursory = function(spec) {
	return function(store) {
		function cursor(entries, listeners, ancestor) {
			var getCached = false;
			var getCache;

			var self = function(x) {
				return arguments.length === 0 ?
					self.get() :
					self.set(x);
			};

			self.enter = function() {
				return cursor(entries.concat(toArr(arguments)), listeners, self);
			};

			self.parent = function() {
				if (entries.length === 0)
					throw Error("parent() called on root cursor");
				return cursor(entries.slice(0, -1), listeners, self);
			};

			self.get = function() {
				if (getCached) return getCache;
				getCached = true;
				getCache = spec.get(store, entries);
				return getCache;
			};

			self.set = function(val) {
				if (getCached && val === getCache) return; // TODO: more rigorous equality? maybe in the spec?
				self._invalidate();
				store = entries.length ? spec.set(store, entries, val) : val;
				listeners.forEach(function(listener) {
					listener(cursor([], listeners));
				});
			};

			self.transact = function(f) {
				self.set(f(self.get()));
			};

			self.onChange = function(listener) {
				listeners.push(listener);
			};

			self._invalidate = function() {
				getCached = false;
				if (ancestor) ancestor._invalidate();
			};

			return self;
		}

		return cursor([], []);
	};
};

module.exports = precursory;
