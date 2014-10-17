var tape = require('tape');
var cursor = require('../mori');
var M = require('mori');

tape("Root cursor", function(t) {
	var map = M.hash_map("a", 1, "b", M.hash_map("c", 2));
	var mapCursor = cursor(map);

	t.deepEquals(mapCursor.get(), map, "get");

	var newMap = M.hash_map("a", 2, "c", M.hash_map("d", 3));
	mapCursor.set(newMap);
	t.ok(M.equals(mapCursor.get(), newMap), "set");

	mapCursor.transact(function(map) {
		return M.assoc_in(map, ["c", "d"], 4);
	});
	t.ok(M.equals(mapCursor.get(), M.hash_map("a", 2, "c", M.hash_map("d", 4))), "transact");

	var unique = {};
	var onChangeVal = unique;
	mapCursor.onChange(function(val) {
		onChangeVal = val;
	});
	t.is(onChangeVal, unique, "onChange not called immediately");
	mapCursor.set(map);
	t.is(onChangeVal.get(), map, "onChange returns a cursor of the new value");

	t.end();
});

tape("Sub-cursor", function(t) {
	var map = {a: 1, b: {c: {d: 2}}};
	var mapClone = clone(map);
	var mapCursor = cursor(map);
	var subCursor = mapCursor.enter('b', 'c');

	t.deepEquals(subCursor.get(), {d: 2}, "enter and get");

	subCursor.set({e: 3});
	t.deepEquals(subCursor.get(), {e: 3}, "set");
	t.deepEquals(mapCursor.get(), {a: 1, b: {c: {e: 3}}}, "set propagates to parent");
	t.deepEquals(map, mapClone, "set doesn't mutate original");

	subCursor.transact(function(map) {
		var result = clone(map);
		result.f = 4;
		return result;
	});
	t.deepEquals(subCursor.get(), {e: 3, f: 4}, "transact");
	t.deepEquals(mapCursor.get(), {a: 1, b: {c: {e: 3, f: 4}}}, "transact propagates to parent");

	var unique = {};
	var onChangeVal = unique;
	mapCursor.onChange(function(val) {
		onChangeVal = val;
	});
	t.is(onChangeVal, unique, "onChange not called immediately");
	subCursor.set({d: 2});
	t.deepEquals(onChangeVal.get(), map, "Subcursor changes cause onChange listeners on root to be called");

	t.end();
});
