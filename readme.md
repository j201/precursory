#precursory

Make cursors from any data structure. Includes cursors for mori associative structures and JS objects.

---

##Rationale

A few implementations have been made for JS cursors in React, for example, [Cortex](https://github.com/mquan/cortex) and [react-cursor](https://github.com/dustingetz/react-cursor). (Quick summary: ClojureScript's Om introduced cursors, which allow you to scope a part of a UI to a part of your app's state while applying state updates to the entire state. They allow you to keep state centralized and easy to manage without having to deal with extremely nested manipulations.) However, they deal with native JS objects, which limits your choice of how you want to represent application state. For example, if you want to use [mori](http://swannodette.github.io/mori/) structures, you're out of luck. So this library lets you construct a cursor implementation given a couple of simple functions you provide for your data structure of choice.

##Example

- [Mori example](http://j201.github.io/precursory/examples/mori/index.html) and [code](http://j201.github.io/precursory/examples/mori/app.js)
- [Object example](http://j201.github.io/precursory/examples/obj/index.html) and [code](http://j201.github.io/precursory/examples/obj/app.js)

##Usage

```
npm install precursory
```

```
var precursory = require('precursory'); // To build your own cursors

var objCursor = require('precursory/obj'); // To use the included JS object cursors
var myCursor = objCursor({a: {b: 1}});
myCursor.enter('a', 'b').set(2);
myCursor.get(); // {a: {b: 2}}

var moriCursor = require('precursory/mori'); // To use the included mori cursors
var myCursor = moriCursor(mori.hash_map('a', mori.hash_map('b', 1)));
myCursor.enter('a', 'b').set(2);
myCursor.get(); // {"a" {"b" 2}}

// You can also use jQuery/Knockout-style get and set:
myCursor.enter('a')('foo');
myCursor(); // {"a" "foo"}
```

##Making your own cursors

So the kind of data structure you'd use is one that's a container for other data, where a subset of that data can also be retrieved by moving into a part of the data structure. An example would be a nested JS object where a subset of the data could be retrieved by moving to a property of that object. In general, the data structure has an operation (called `enter` here) that, when passed some value, returns a substructure. You could also take an array of such values (called `entries` here) and go arbitrarily deep into the data structure (something like `subStructure = entries.reduce(enter, dataStructure)`). These ideas are important in setting up a data structure for use with precursory.

###Data Structure Specs

First of all, you need a spec that will tell precursory how to handle your data structure. It should be an object containing the following functions as properties:

**get(data, entries)**

Given an array `entries`, returns the value produced by `enter`ing into `data` using each value from `entries` in order. An example would be that `get({a: {b: {c: 1}}}, ['a', 'b'])` should return `{c: 1}`.

**set(data, entries, value)**

Given an array `entries`, returns the value produced by `enter`ing into `data` using each value from `entries` in order and replacing the resulting value with the `value` argument. **The original data structure should not be modified; a new one should be returned.** An example would be that `set({a: {b: {c: 1}}}, ['a', 'b'], {d: 2})` should return `{a: {b: {d: 2}}}`.

###precursory(spec)

Once you have such a spec, pass it to the function exported by precursory. This will return a cursor builder function that can handle your data structure. When you call this new function with an instance of your data structure, it will return a cursor for that data!

###Methods of cursors

Once you have a cursor, you can call the following functions on it:

**enter(...entries)**

Produces a new cursor representing a subset of the cursor's data as specified by its arguments. For example, if `c` is a cursor representing `{a: {b: {c: 1}}}`, then `c.enter('a', 'b')` will return a cursor representing `{c: 1}`.

**parent()**

Returns the parent of the cursor. That is, the cursor with all of the entries passed to `enter` except the last one. If called on a root cursor, an error is thrown.

**get()**

Returns the value stored in the cursor.

**()**

Same as `get`

**set(newValue)**

Replaces the value in the cursor with `newValue`. (This will affect all parent cursors too, since they represent the same data.)

**(newValue)**

Same as `set`

**transact(f)**

Replaces the value in the cursor with the result of calling `f` on the current value.

**path()**

Returns an array of the keys that have been passed to `enter` to get to the current cursor value.

**onChange(listener)**

Registers `listener` so that when the value in this cursor changes, `listener` is called with the array of keys (the same as `path()`) for the cursor where `set` was called. Listeners on the parent are then also called up to the root cursor.

**forceChange()**

Causes the onChange listeners to run.

##Use with React

Im order to notify React of updates, attach a listener to your cursor using `onChange`:

```
// Stores an array of todo objects
var store = cursor([{desc: 'Vacuum the cat', completed: false}]);

var myRoot = React.renderComponent(Root({ store: store }), document.getElementById('react-container'));

store.onChange(function() {
	myRoot.forceUpdate();
});
```

##Cheat Sheet

```
spec: {
	get: (data, entries) => value,
	set: (data, entries, newValue) => newData
}

precursory: spec => (data => cursor)

cursor: () => value
        newValue => void

cursor methods: {
	enter: (...entries) => newCursor,
	parent: () => newCursor,
	get: () => value,
	set: newValue => void,
	transact: (value => newValue) => void
	path: () => entries[]
	onChange: (data => void) => void
	forceChange: () => void
}
```

##Tests

```
npm test
```

©2014 j201, Licensed under the [MIT Licence](http://opensource.org/licenses/MIT).
