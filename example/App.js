import React, { useState } from 'react'
// import { rj } from 'redux-rocketjump'
import { rj as reactRj, ConfigureRj } from 'react-rocketjump'
import Todos from './components/Todos'
import ReactTodos from './components/ReactTodos'

// const reduxRj = rj({
//   type: 'DRAGO_23',
//   state: 'dragos',
//   api: () => Promise.resolve(23)
// })

// const reactRjState = reactRj({
//   effect: () => Promise.resolve(23)
// })()


// console.log(reactRj.fromReduxRj(reduxRj))
// const reduxRjState = reduxRj()
// console.log(reactRjState)
// console.log(runAsReactRj(reduxRj))

// console.log(reduxRjState)

const callMaMen = (apiFn, ...params) => {
  return apiFn(...params, 'GIOVA THE KING @@@23')
}

export default function App() {
  return (
    // <ConfigureRj callEffect={callMaMen}>
      <div>
        <ReactTodos />
      </div>
    // </ConfigureRj>
  )
}
