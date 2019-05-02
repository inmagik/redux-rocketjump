import combineRjs from '../../combineRjs'

export default (...args) => {

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      "[redux-rocketjump] DeprecationWarning: " +
      "please use combineRjs directly from redux-rocketjump \n"+
      "import { combineRjs } from 'redux-rocketjump'"
    )
  }

  return combineRjs(...args)
}
