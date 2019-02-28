import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import {
  getTodos,
  loadTodos,
  addTodo,
  areTodosLoading,
  isAddingTodo,
  updateTodo,
  getUpdatingTodos,
  getDeletingTodos,
  deleteTodo,
} from '../state/todos'
import { todoListStore, todoDetailStore } from '../state/todos2'
import Todo from './Todo'
import NewTodo from './NewTodo'

class Todos extends PureComponent {
  componentDidMount() {
    this.props.loadTodos()
    this.props.loadTodo(3)
  }

  onToggle = todo => this.props.updateTodo({
    ...todo,
    done: !todo.done,
  })

  onRemove = todo => this.props.deleteTodo(todo.id)

  render() {
    const { todos, addTodo, loading, adding, updating, deleting } = this.props
    return (
      <div className='todos'>
        {loading && <div>Loading <b>Y</b> todos...</div>}
        {todos && <NewTodo onSubmit={addTodo} adding={adding} />}
        <div className='todo-list'>
          {todos && todos.map(todo => (
            <Todo
              saving={updating[todo.id] || deleting[todo.id]}
              onToggle={this.onToggle}
              onRemove={this.onRemove}
              key={todo.id}
              todo={todo}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  todos: getTodos(state),
  // todos: todoListStore.selectors.getData(state),
  loading: areTodosLoading(state),
  adding: isAddingTodo(state),
  updating: getUpdatingTodos(state),
  deleting: getDeletingTodos(state)
}), {
  loadTodos: todoListStore.actions.load,
  loadTodo: todoDetailStore.actions.load,
  addTodo,
  updateTodo,
  deleteTodo,
})(Todos)
