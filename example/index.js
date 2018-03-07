import './index.css'
import ReactDOM from 'react-dom'
import React from 'react'
import { Provider } from 'react-redux'
import store from './state'
import Todos from './components/Todos'

const App = () => (
  <Provider store={store}>
    <Todos />
  </Provider>
)

ReactDOM.render(<App />, document.getElementById('root'))
