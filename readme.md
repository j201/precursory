#react-precursor

Make cursors for React from any data structure

---

##Rationale

A few implementations have been made for JS cursors in React, for example, [Cortex](https://github.com/mquan/cortex) and [react-cursor](https://github.com/dustingetz/react-cursor). (Quick summary: ClojureScript's Om introduced cursors, which allow you to scope a part of a UI to a part of your app's state while applying state updates to the entire state. They allow you to keep state centralized and easy to manage without having to deal with extremely nested manipulations.) However, they deal with native JS objects, which limits your choice of how you want to represent application state. For example, if you want to use [mori](http://swannodette.github.io/mori/) structures, you're out of luck. So this library lets you construct a cursor implementation given a couple of simple functions you provide for your data structure of choice.

##Stability

I started this on October 2nd. So it's probably buggy as hell and it'll definitely have huge API changes.

##Example

[See it here](https://rawgit.com/j201/react-precursor/master/examples/obj/index.html) and [see the code here](https://github.com/j201/react-precursor/blob/master/examples/obj/app.js).

##Usage

So the kind of data structure you'd use is one that's a container for other data, where a subset of that data can also be retrieved by moving into a part of the data structure. An example would be a nested JS object where a subset of the data could be retrieved by moving to a property of that object. In general, the data structure has an operation (called `enter` here) that, when passed some value, returns a substructure. You could also take an array of such values (called `entries` here) and go arbitrarily deep into the data structure (something like `subStructure = entries.reduce(enter, dataStructure)`). These ideas are important in setting up a data structure for use with react-precursor.

###Data Structure Specs

First of all, you need a spec that will tell react-precursor how to handle your data structure. It should be an object containing the following functions as properties:

**get(data, entries)**

Given an array `entries`, returns the value produced by `enter`ing into `data` using each value from `entries` in order. An example would be that `get({a: {b: {c: 1}}}, ['a', 'b'])` should return `{c: 1}`.

**set(data, entries, value)**

Given an array `entries`, returns the value produced by `enter`ing into `data` using each value from `entries` in order and replacing the resulting value with the `value` argument. **The original data structure should not be modified; a new one should be returned.** An example would be that `set({a: {b: {c: 1}}}, ['a', 'b'], {d: 2})` should return `{a: {b: {d: 2}}}`.

A sample spec (for JS objects) can be seen in `./specs/obj.js`.

###precursor(spec)

Once you have such a spec, pass it to the function exported by react-precursor. This will return a cursor builder function that can handle your data structure. When you call this new function with an instance of your data structure, it will return a cursor for that data!

###Methods of cursors

Once you have a cursor, you can call the following functions on it:

**enter(...entries)**

Produces a new cursor representing a subset of the cursor's data as specified by its arguments. For example, if `c` is a cursor representing `{a: {b: {c: 1}}}`, then `c.enter('a', 'b')` will return a cursor representing `{c: 1}`.

**get()**

Returns the value stored in the cursor.

**set(newValue)**

Replaces the value in the cursor with `newValue`. (This will affect all parent cursors too, since they represent the same data.)

**transact(f)**

Replaces the value in the cursor with the result of calling `f` on the current value.

**onChange(listener)**

Registers `listener` so that when the value in this cursor changes, `listener` is called with a new cursor to the root data as an argument. This is a temporary way to notify React of changes, which must currently be done manually with something like `rootCursor.listen(function(newCursor) { rootComponent.setProps({ data: newCursor}); });`. Note that all cursors currently share the same set of listeners.

##Cheat Sheet

```
spec: {
	get: (data, entries) => value,
	set: (data, entries, newValue) => newData
}

precursor: spec => (data => cursor)

cursor: {
	enter: entry => newCursor,
	get: () => value,
	set: newValue => void,
	transact: (value => newValue) => void
	onChange: (data => void) => void
}
```

##TODO

- Add `parent` cursor method?
- Tests
- Add a function to attach a cursor to a root element (rather than making people use onChange)
- Allow specs to define more specific equality checks
- `shouldComponentUpdate` optimization like Om
- `pendingValue()` like react-cursor? (I don't think of delaying `setState` as a bug. Allowing subsequent state modifications is too mutation-oriented for my liking. Are there still cases where `pendingValue` could be useful?)
