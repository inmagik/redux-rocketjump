import { combineReducers } from 'redux'
import { resetReducerOn } from '../helpers'
import { mergeUnloadBy } from './helpers'
import {
  makeMutationActionTypeSuccess,
  makeMutationActionTypeMain,
} from './actions'

// enhance the basic reducer \w updater of mutations to rj root reducer
export function enhanceReducer(mutations, reducer, actionCreators, runConfig) {
  const handleMutationsReducers = Object.keys(mutations).reduce((all, name) => {
    const mutation = mutations[name]

    let update

    if (typeof mutation.updater === 'string') {
      const actionCreator = actionCreators[mutation.updater]
      if (typeof actionCreator !== 'function') {
        throw new Error(
          `[redux-rocketjump] @mutations you provide a non existing ` +
            `action creator [${mutation.updater}] as updater for mutation [${name}].`
        )
      }
      update = (state, action) =>
        reducer(state, actionCreator(action.payload.data))
    } else if (typeof mutation.updater === 'function') {
      update = (state, action) => mutation.updater(state, action.payload.data)
    } else {
      throw new Error(
        '[redux-rocketjump] @mutations you should provide at least ' +
          `an effect and an updater to mutation config [${name}].`
      )
    }

    const type = makeMutationActionTypeSuccess(runConfig.type, name, mutation)
    return {
      ...all,
      [type]: update,
    }
  }, {})

  return (prevState, action) => {
    if (handleMutationsReducers[action.type]) {
      return handleMutationsReducers[action.type](prevState, action)
    }
    return reducer(prevState, action)
  }
}

const makeMutationReducer = (parentType, name, mutation) => {
  return (state, action) => {
    if (state === undefined) {
      return mutation.reducer(state, action)
    }
    const mainMutationType = makeMutationActionTypeMain(
      parentType,
      name,
      mutation
    )
    const index = action.type.indexOf(mainMutationType)
    if (index !== -1) {
      const type = action.type
      let decoupleType = type.substr(
        index + mainMutationType.length + 1,
        type.length
      )
      // Decouple as RUN the run mutation action type
      if (decoupleType === '') {
        decoupleType = 'RUN'
      }
      return mutation.reducer(state, { ...action, type: decoupleType })
    }
    return state
  }
}

export function makeMutationsReducer(mutations, runConfig, parentUnloadBy) {
  const mutationsReducers = Object.keys(mutations).reduce((all, name) => {
    const mutation = mutations[name]

    if (typeof mutation.reducer !== 'function') {
      return all
    }

    let reducer = makeMutationReducer(runConfig.type, name, mutation)
    let unloadBy = mergeUnloadBy(
      runConfig.type,
      parentUnloadBy,
      mutation.unloadBy
    )
    if (unloadBy) {
      reducer = resetReducerOn(unloadBy, reducer)
    }

    return {
      ...all,
      [name]: reducer,
    }
  }, {})

  return combineReducers(mutationsReducers)
}
