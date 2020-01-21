import React, { useCallback } from 'react'
import Todo from './Todo'
import NewTodo from './NewTodo'
import { ReduxTodos } from '../state/todos'
import { useRunRj } from 'redux-rocketjump'

export default function Todos() {
  const [
    { todos, loading, adding, updating, deleting },
    { addTodo, updateTodo, deleteTodo },
  ] = useRunRj(ReduxTodos)

  const toggleTodo = useCallback(
    todo => {
      updateTodo({
        ...todo,
        done: !todo.done,
      })
    },
    [updateTodo]
  )

  return (
    <div className="todos">
      {loading && (
        <div>
          Loading <b>Y</b> todos...
        </div>
      )}
      {todos && <NewTodo onSubmit={addTodo} adding={adding} />}
      <div className="todo-list">
        {todos &&
          todos.map(todo => (
            <Todo
              saving={updating[todo.id] || deleting[todo.id]}
              onToggle={toggleTodo}
              onRemove={deleteTodo}
              key={todo.id}
              todo={todo}
            />
          ))}
      </div>
    </div>
  )
}
