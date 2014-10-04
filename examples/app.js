var React = require('react');
var dom = React.DOM;
var cursor = require('../specs/obj');

var store = cursor([]);

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
				ref: "input"
			}) :
			dom.span({
				className: 'entry',
				onClick: this.onClick
			}, this.props.value.get());
	},
	componentDidUpdate: function() {
		if (this.state.editing)
			this.refs.input.getDOMNode().focus();
	}
});

var Root = React.createClass({
	addRow: function() {
		console.log(this.props.store === store);
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
