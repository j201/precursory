var React = require('react');
var dom = React.DOM;
var M = require('mori');
var cursor = require('../../specs/mori');

var append = function(x, s) { return M.concat(s, [x]); };

// Stores an array of todo objects
var store = cursor(M.vector(M.hash_map('desc', 'Vacuum the cat', 'completed', false)));

// A span with text that can be edited by clicking on it and changing the value in a text input
var EditableText = React.createClass({
	getInitialState: function() {
		return { editing: false }
	},
	onBlur: function(e) {
		this.props.set(e.target.value);
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
			}, this.props.get());
	},
	componentDidUpdate: function() {
		if (this.state.editing) {
			var input = this.refs.input.getDOMNode();
			input.focus();
			input.value = this.props.get();
		}
	}
});

var Row = React.createClass({
	check: function() {
		var todo = this.props.todo;
		todo.enter('completed').set(!M.get(todo.get(), 'completed'));
	},
	render: function() {
		var todo = this.props.todo;
		var completed = M.get(todo.get(), 'completed');
		return dom.li({ className: completed ? 'completed' : '' },
			dom.input({ type: 'checkbox', value: completed, onChange: this.check }),
			EditableText(todo.enter('desc')),
			dom.button({ onClick: this.props.remove }, 'X'));
	}
});


var Root = React.createClass({
	getInitialState: function() {
		return { newTodo: '' }
	},
	updateNewTodo: function(e) {
		this.setState({ newTodo: e.target.value });
	},
	onKeyDown: function(e) {
		if (this.state.newTodo.length > 0 && e.key === "Enter") {
			this.props.store.transact(append.bind(null, M.hash_map("desc", this.state.newTodo, "completed", false)));
			this.setState({ newTodo: '' });
		}
	},
	deleteRow: function(i) {
		this.props.store.transact(function(rows) {
			return M.concat(M.take(i, rows), M.drop(i+1, rows));
		});
	},
	render: function() {
		var store = this.props.store;
		return dom.div({},
			dom.input({
				value: this.state.newTodo,
				onChange: this.updateNewTodo,
				onKeyDown: this.onKeyDown
			}),
			dom.ul({},
				M.into_array(M.range(M.count(store.get()))).map(function(i) {
					return Row({
						todo: store.enter(i),
						remove: this.deleteRow.bind(this, i)
					});
				}.bind(this))));
	}
});

var myRoot = React.renderComponent(Root({ store: store }), document.getElementById('react-container'));

store.onChange(function(newStore) {
	myRoot.setProps({ store: newStore });
});
