var React = require('react');
var dom = React.DOM;
var cursor = require('../../obj');

// Stores an array of todo objects
var store = cursor([{desc: 'Vacuum the cat', completed: false}]);

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
		todo.enter('completed').set(!todo.get().completed);
	},
	render: function() {
		var todo = this.props.todo;
		return dom.li({ className: todo.get().completed ? 'completed' : '' },
			dom.button({ className: 'check-button', onClick: this.check }, '✓'),
			EditableText(todo.enter('desc')),
			dom.button({ className: 'delete-button', onClick: this.props.remove }, 'X'));
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
			this.props.store.set(this.props.store.get().concat({ desc: this.state.newTodo, completed: false }));
			this.setState({ newTodo: '' });
		}
	},
	deleteRow: function(i) {
		// 'remove' an array element without mutating it
		// this is why mori would be nice to use with cursors :/
		var newRows = this.props.store.get().reduce(function(acc, el, _i) {
			return _i === i ? acc : acc.concat(el);
		}, []);
		this.props.store.set(newRows);
	},
	render: function() {
		var store = this.props.store;
		return dom.div({},
			dom.input({
				value: this.state.newTodo,
				onChange: this.updateNewTodo,
				onKeyDown: this.onKeyDown,
				placeholder: "New todo"
			}),
			dom.ul({},
				store.get().map(function(row, i) {
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
