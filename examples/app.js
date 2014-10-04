var React = require('react');
var dom = React.DOM;
var cursor = require('../specs/obj');

// Stores an array of name/description objects
var store = cursor([{name: 'Guy Incognito', desc: '(123)-456-7890'}]);

// A span with text that can be edited by clicking on it and changing the value in a text input
var EditableText = React.createClass({
	getInitialState: function() {
		return { editing: false }
	},
	onBlur: function(e) {
		this.props.value.set(e.target.value);
		this.setState({editing: false});
	},
	onClick: function() {
		this.setState({editing: true});
	},
	render: function() {
		return this.state.editing ?
			dom.input({
				onBlur: this.onBlur,
				className: 'editable',
				ref: "input"
			}) :
			dom.span({
				className: 'editable',
				onClick: this.onClick
			}, this.props.value.get());
	},
	componentDidUpdate: function() {
		if (this.state.editing) {
			var input = this.refs.input.getDOMNode();
			input.focus();
			input.value = this.props.value.get();
		}
	}
});

var Root = React.createClass({
	addRow: function() {
		this.props.store.set(this.props.store.get().concat({ name: '', desc: '' }));
	},
	render: function() {
		var store = this.props.store;
		var rows = store.get().map(function(row, i) {
			return dom.tr({ key: i },
				dom.td({}, EditableText({ value: store.enter(i, 'name') })),
				dom.td({}, EditableText({ value: store.enter(i, 'desc') })));
		});
		return dom.div({},
			dom.table({}, rows),
			dom.button({
				onClick: this.addRow
			}, "Add Row"));
	}
});

var myRoot = React.renderComponent(Root({ store: store }), document.getElementById('react-container'));

store.onChange(function(newStore) {
	myRoot.setProps({ store: newStore });
});
