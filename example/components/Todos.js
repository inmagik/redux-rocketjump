import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { getTodos, loadTodos, addTodo, areTodosLoading } from '../state/todos'
import Todo from './Todo'
import NewTodo from './NewTodo'

class Todos extends PureComponent {
  componentDidMount() {
    this.props.loadTodos({}, { giova: 23 })
    this.props.loadTodos({}, { giova: 22 })
  }

  // addTodo = todo => {
  //   console.log('NEW TODO!', todo)
  // }

  render() {
    const { todos, addTodo, loading } = this.props
    return (
      <div className='todos'>
        {loading && <div>Loading <b>Y</b> todos...</div>}
        {todos && <NewTodo onSubmit={addTodo}/>}
        <div className='todo-list'>
          {todos && todos.map(todo => (
            <Todo
              saving={`${todo.id}`.indexOf('pushing-') !== -1}
              key={todo.id || 'adding-todo'}
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
  loading: areTodosLoading(state),
}), {
  loadTodos,
  addTodo,
})(Todos)
