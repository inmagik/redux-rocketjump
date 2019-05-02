import React from 'react'
import { rj} from 'redux-rocketjump'
import { rj as reactRj } from 'react-rocketjump'

const reduxRj = rj({
  type: 'DRAGO_23',
  state: 'dragos',
  api: () => Promise.resolve(23)
})

const reactRjState = reactRj({
  effect: () => Promise.resolve(23)
})()


console.log(reactRj.fromReduxRj(reduxRj))
// const reduxRjState = reduxRj()
// console.log(reactRjState)
// console.log(runAsReactRj(reduxRj))

// console.log(reduxRjState)

export default function App() {
  return (
    <div>
      <h1>Hello Rocketjump!</h1>
    </div>
  )
}
