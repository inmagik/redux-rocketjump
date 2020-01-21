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
  TodosState,
} from '../state/todos'
import Todo from './Todo'
import NewTodo from './NewTodo'
import { useRj, useRunRj } from 'redux-rocketjump'

export default function Todos() {
  const rjRunnable = useRunRj(
    TodosState,
    [],
    true
    // (state, { getData }) => ({
    //   todos: getData(state),
    // })
  )
  const [state, { run, addTodo }] = rjRunnable
  console.log('RjRunnable', rjRunnable)

  return (
    <div>
      Todos
      <button
        onClick={() =>
          run
            .onSuccess(() => alert('FUCK!'))
            .withMeta({ giova: 23 })
            .run('BaBu', 'Is', 'Cool')
        }
      >
        RUN
      </button>
      <button
        disabled={state.addingTodo}
        onClick={() =>
          addTodo
            .onSuccess(() => alert('FUCK!'))
            .withMeta({ giova: 23 })
            .run({
              done: false,
              title: 'FUCK THE WORLD!',
            })
        }
      >
        Add TODO
      </button>
    </div>
  )
}
// class Todos extends PureComponent {
//   componentDidMount() {
//     this.props.loadTodos()
//   }
//
//   onToggle = todo => this.props.updateTodo({
//     ...todo,
//     done: !todo.done,
//   })
//
//   onRemove = todo => this.props.deleteTodo(todo.id)
//
//   render() {
//     const { todos, addTodo, loading, adding, updating, deleting } = this.props
//     return (
//       <div className='todos'>
//         {loading && <div>Loading <b>Y</b> todos...</div>}
//         {todos && <NewTodo onSubmit={addTodo} adding={adding} />}
//         <div className='todo-list'>
//           {todos && todos.map(todo => (
//             <Todo
//               saving={updating[todo.id] || deleting[todo.id]}
//               onToggle={this.onToggle}
//               onRemove={this.onRemove}
//               key={todo.id}
//               todo={todo}
//             />
//           ))}
//         </div>
//       </div>
//     )
//   }
// }
//
// export default connect(state => ({
//   todos: getTodos(state),
//   loading: areTodosLoading(state),
//   adding: isAddingTodo(state),
//   updating: getUpdatingTodos(state),
//   deleting: getDeletingTodos(state)
// }), {
//   loadTodos,
//   addTodo,
//   updateTodo,
//   deleteTodo,
// })(Todos)
