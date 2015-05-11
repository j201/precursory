var tape = require('tape');
var cursor = require('../mori');
var M = require('mori');

tape("Root cursor", function(t) {
	var map = M.hashMap("a", 1, "b", M.hashMap("c", 2));
	var mapCursor = cursor(map);

	t.deepEquals(mapCursor.get(), map, "get");
	t.deepEquals(mapCursor(), map, "get as function");

	var newMap = M.hashMap("a", 2, "c", M.hashMap("d", 3));
	mapCursor.set(newMap);
	t.ok(M.equals(mapCursor.get(), newMap), "set");

	var mapCursor2 = cursor(map);
	mapCursor2(newMap);
	t.ok(M.equals(mapCursor2.get(), newMap), "set as function");

	mapCursor.transact(function(map) {
		return M.assocIn(map, ["c", "d"], 4);
	});
	t.ok(M.equals(mapCursor.get(), M.hashMap("a", 2, "c", M.hashMap("d", 4))), "transact");

	var unique = {};
	var onChangeVal = unique;
	mapCursor.onChange(function(val) {
		onChangeVal = val;
	});
	t.is(onChangeVal, unique, "onChange not called immediately");
	mapCursor.set(map);
	t.deepEquals(onChangeVal, [], "onChange returns the path of the change");

	var called = false;
	mapCursor.onChange(function() {
		called = true;
	});
	mapCursor.forceChange();
	t.ok(called, "forceChange");

	t.end();
});

tape("Sub-cursor", function(t) {
	var map = M.hashMap("a", 1, "b", M.hashMap("c", M.hashMap("d", 2)));
	var mapCursor = cursor(map);
	var subCursor = mapCursor.enter('b', 'c');

	t.ok(M.equals(subCursor.get(), M.hashMap("d", 2)), "enter and get");

	t.ok(M.equals(subCursor.parent().get(), M.hashMap("c", M.hashMap("d", 2))), "enter and get");

	t.deepEquals(subCursor.path(), ['b', 'c'], "path");

	subCursor.set(M.hashMap("e", 3));
	t.ok(M.equals(subCursor.get(), M.hashMap("e", 3)), "set");
	t.ok(M.equals(mapCursor.get(), M.hashMap("a", 1, "b", M.hashMap("c", M.hashMap("e", 3)))), "set propagates to parent");

	subCursor.transact(function(map) {
		return M.assoc(map, "f", 4);
	});
	t.ok(M.equals(subCursor.get(), M.hashMap("e", 3, "f", 4)), "transact");
	t.ok(M.equals(mapCursor.get(), M.hashMap("a", 1, "b", M.hashMap("c", M.hashMap("e", 3, "f", 4)))), "transact propagates to parent");

	var unique = {};
	var onChangeVal = unique;
	mapCursor.onChange(function(val) {
		onChangeVal = val;
	});
	t.is(onChangeVal, unique, "onChange not called immediately");
	subCursor.set(M.hashMap("d", 2));
	t.deepEquals(onChangeVal, ['b', 'c'], "Subcursor changes cause onChange listeners on root to be called");

	t.end();
});
