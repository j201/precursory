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
// path :: () => TEnter[]
// onChange :: (TData => void) => void
// forceChange :: (TEnter[]?) => void
var precursory = function(spec) {
	return function(store) {
		function cursor(entries, listeners, parent) {
			var getCached = false;
			var getCache;

			var self = function(x) {
				return arguments.length === 0 ?
					self.get() :
					self.set(x);
			};

			self.enter = function() {
				var keys = toArr(arguments);
				var child = cursor(entries.concat(keys.slice(0, 1)), listeners, self);
				return keys.length === 1 ?
					child :
					child.enter.apply(child, keys.slice(1));
			};

			self.parent = function() {
				if (entries.length === 0)
					throw Error("parent() called on root cursor");
				return parent;
			};

			self.path = function() {
				return entries;
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
				self.forceChange();
			};

			self.transact = function(f) {
				self.set(f(self.get()));
			};

			self.onChange = function(listener) {
				listeners.push({ path: self.path(), fn: listener });
			};

			self.forceChange = function(path) {
				path = path || entries;
				listeners.forEach(function(listener) {
					// Only call listeners registered on parents
					if (listener.path.every(function (s, i) {
						return s === entries[i];
					}))
						listener.fn(path); // This previously created a copy of the root cursor - I'm not sure why
				});
			};

			self._invalidate = function() {
				getCached = false;
				if (parent) parent._invalidate();
			};

			return self;
		}

		return cursor([], []);
	};
};

module.exports = precursory;
