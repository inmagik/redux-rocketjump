import React from 'react'
import classNames from 'classnames'

const Todo = ({ todo, saving = false }) => (
  <div className={classNames('todo', {
    'todo-saving': saving,
    'todo-done': todo.done,
  })}>
    <div className='todo-circle'>{todo.done ? '√' : ''}</div>
    <div className='todo-title'>{todo.title}</div>
  </div>
)

export default Todo
