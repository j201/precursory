var tape = require('tape');
var cursor = require('../obj');
var clone = require('clone');

tape("Root cursor", function(t) {
	var obj = {a: 1, b: {c: 2}};
	var objClone = clone(obj);
	var objCursor = cursor(obj);

	t.deepEquals(objCursor.get(), obj, "get");
	t.deepEquals(objCursor(), obj, "get as function");

	var newObj = {a: 2, c: {d: 3}};
	objCursor.set(newObj);
	t.deepEquals(objCursor.get(), newObj, "set");
	t.deepEquals(obj, objClone, "set doesn't mutate original");

	var objCursor2 = cursor(obj);
	objCursor2(newObj);
	t.deepEquals(objCursor2.get(), newObj, "set as function");

	objCursor.transact(function(obj) {
		var result = clone(obj);
		result.c.d = 4;
		return result;
	});
	t.deepEquals(objCursor.get(), {a: 2, c: {d: 4}}, "transact");

	var unique = {};
	var onChangeVal = unique;
	objCursor.onChange(function(val) {
		onChangeVal = val;
	});
	t.is(onChangeVal, unique, "onChange not called immediately");
	objCursor.set(obj);
	t.deepEquals(onChangeVal, [], "onChange returns the path of the change");

	var called = false;
	objCursor.onChange(function() {
		called = true;
	});
	objCursor.forceChange();
	t.ok(called, "forceChange");

	t.end();
});

tape("Sub-cursor", function(t) {
	var obj = {a: 1, b: {c: {d: 2}}};
	var objClone = clone(obj);
	var objCursor = cursor(obj);
	var subCursor = objCursor.enter('b', 'c');

	t.deepEquals(subCursor.get(), {d: 2}, "enter and get");

	t.deepEquals(subCursor.parent().get(), {c: {d: 2}}, "parent");

	t.deepEquals(subCursor.path(), ['b', 'c'], "path");

	subCursor.set({e: 3});
	t.deepEquals(subCursor.get(), {e: 3}, "set");
	t.deepEquals(objCursor.get(), {a: 1, b: {c: {e: 3}}}, "set propagates to parent");
	t.deepEquals(obj, objClone, "set doesn't mutate original");

	subCursor.transact(function(obj) {
		var result = clone(obj);
		result.f = 4;
		return result;
	});
	t.deepEquals(subCursor.get(), {e: 3, f: 4}, "transact");
	t.deepEquals(objCursor.get(), {a: 1, b: {c: {e: 3, f: 4}}}, "transact propagates to parent");

	var unique = {};
	var onChangeVal = unique;
	objCursor.onChange(function(val) {
		onChangeVal = val;
	});
	t.is(onChangeVal, unique, "onChange not called immediately");
	subCursor.set({d: 2});
	t.deepEquals(onChangeVal, ['b', 'c'], "Subcursor changes cause onChange listeners on root to be called");

	t.end();
});
