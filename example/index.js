import '@babel/polyfill'
// import './index.css'
import ReactDOM from 'react-dom'
import React from 'react'
// import { Provider } from 'react-redux'
// import store from './state'
// import Todos from './components/Todos'
import App from './App'

// const Container = () => (
//   // <Provider store={store}>
//     <App />
//     {/* <Todos /> */}
//   // </Provider>
// )

ReactDOM.render(<App />, document.getElementById('root'))
