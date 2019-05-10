import React, { PureComponent, useEffect } from 'react'
import { connectRj, useRj } from 'react-rocketjump'
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
  todosState,
} from '../state/todos'
import { todoListStore, todoDetailStore } from '../state/todos2'
import Todo from './Todo'
import NewTodo from './NewTodo'

class Todos extends PureComponent {
  componentDidMount() {
    
    this.props.loadTodos
      .withMeta({c: 3})
      .onSuccess(() => console.log(1))
      .onFailure(() => console.log(2))
      .run(1)

    // this.props.loadTodos(3)
    
    // this.props.loadTodos(1, 2, 3)

    // this.props.unloadTodos()

    // this.props.unloadTodos.meta({ id: 2 }).run()

  }

  // onToggle = todo => this.props.updateTodo({
  //   ...todo,
  //   done: !todo.done,
  // })

  // onRemove = todo => this.props.deleteTodo(todo.id)

  render() {
    const { todos, addTodo, loading, adding, updating, deleting } = this.props
    return (
      <div className='todos'>
        {/* {loading && <div>Loading <b>Y</b> todos...</div>} */}
        {/* {todos && <NewTodo onSubmit={addTodo} adding={adding} />} */}
        <div className='todo-list'>
          {todos && todos.map(todo => (
            <Todo
              // saving={updating[todo.id] || deleting[todo.id]}
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

// export default function Todos() {
//   const [{ data: todos }, { run: loadTodos }] = useRj(todosState)
//
//   useEffect(() => {
//     loadTodos()
//   }, [loadTodos])
//
//   return (
//     <div className='todos'>
//       {/* {loading && <div>Loading <b>Y</b> todos...</div>} */}
//       {/* {todos && <NewTodo onSubmit={addTodo} adding={adding} />} */}
//       <div className='todo-list'>
//         {todos && todos.map(todo => (
//           <Todo
//             // saving={updating[todo.id] || deleting[todo.id]}
//             // onToggle={this.onToggle}
//             // onRemove={this.onRemove}
//             key={todo.id}
//             todo={todo}
//           />
//         ))}
//       </div>
//     </div>
//   )
// }

export default connectRj(
  todosState,
  state => ({
    todos: state.data,
  }),
  ({ run, unload }) => ({
    loadTodos: run,
    unloadTodos: unload
  })
)(Todos)

// export default connect(state => ({
//   todos: getTodos(state),
//   // todos: todoListStore.selectors.getData(state),
//   loading: areTodosLoading(state),
//   adding: isAddingTodo(state),
//   updating: getUpdatingTodos(state),
//   deleting: getDeletingTodos(state)
// }), {
//   loadTodos: todoListStore.actions.load,
//   loadTodo: todoDetailStore.actions.load,
//   addTodo,
//   updateTodo,
//   deleteTodo,
// })(Todos)
