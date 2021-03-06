var update = require('react/addons').addons.update;
var precursory = require('./lib');

module.exports = precursory({
	get: function(obj, props) {
		return props.reduce(function(acc, el) {
			return acc[el];
		}, obj);
	},
	set: function(obj, props, val) {
		var updater = props.reduceRight(function(acc, el) {
			var o = {};
			o[el] = acc;
			return o;
		}, {$set: val});
		return update(obj, updater);
	}
});
