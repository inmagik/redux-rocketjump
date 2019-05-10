import React, { PureComponent } from 'react'
import { connectRj } from 'react-rocketjump'
import Todo from './Todo'
import { TodosListState } from '../state/todosState'

class Todos extends PureComponent {
  componentDidMount() {

    this.props.loadTodos()

  }

  render() {
    const { todos, deleteTodo, updateTodo, addTodo } = this.props
    console.log(this.props)
    return (
      <div className='todos'>
        <div className='todo-list'>
          {todos && todos.map(todo => (
            <Todo
              onToggle={todo => updateTodo({ ...todo, done: true })}
              onRemove={deleteTodo}
              key={todo.id}
              todo={todo}
            />
          ))}
        </div>
        <button type="button" onClick={() => addTodo({ title: 'Sei', id: 6, done: false })}>Add</button>
      </div>
    )
  }
}

export default connectRj(
  TodosListState,
  (state, { getList }) => ({
    todos: getList(state),
  }),
  ({ run, clean, deleteItem, updateItem, insertItem }) => ({
    loadTodos: run,
    unloadTodos: clean,
    deleteTodo: deleteItem,
    updateTodo: updateItem,
    addTodo: insertItem
  })
)(Todos)
