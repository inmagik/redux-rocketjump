import React from 'react'
import { Provider } from 'react-redux'
import Todos from './components/Todos'
import store from './state'
import { ReduxTodos, ReduxSbatteTodos } from './state/todos'

export default function App() {
  return (
    <Provider store={store}>
      <Todos rjObject={ReduxTodos} />
      <h1>Sbatte</h1>
      <Todos rjObject={ReduxSbatteTodos} />
    </Provider>
  )
}
