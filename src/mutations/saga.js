import { fork } from 'redux-saga/effects'
import makeApiSaga from '../apiSaga'
import { takeEveryAndCancel } from '../effects'
import { makeMutationActionTypes } from './actions'
import { mergeUnloadBy } from './helpers'

const makeMutationSaga = (mutation, name, sideEffect, runConfig) => {
  const { effect } = mutation

  if (typeof effect !== 'function') {
    throw new Error(
      '[redux-rocketjump] @mutations you should provide at least ' +
        `an effect and an updater to mutation config [${name}].`
    )
  }

  const mutationSideEffect = {
    unloadBy: mergeUnloadBy(
      runConfig.type,
      sideEffect.unloadBy,
      mutation.unloadBy
    ),
    effectCaller: mutation.effectCaller || sideEffect.effectCaller,
  }

  if (mutation.takeEffect) {
    // Use provided mutation side effect
    mutationSideEffect.takeEffect = mutation.takeEffect
    mutationSideEffect.takeEffectArgs = mutation.takeEffectArgs
  } else {
    // Use generic every take effect
    mutationSideEffect.takeEffect = takeEveryAndCancel
  }

  const mutationActionTypes = makeMutationActionTypes(
    runConfig.type,
    name,
    mutation
  )

  return makeApiSaga(
    mutationActionTypes,
    effect,
    undefined, // Effect extra params not needed
    mutationSideEffect.takeEffect,
    mutationSideEffect.effectCaller,
    undefined, // Need effect not needed
    undefined, // Success effect not needed
    undefined, // Failure effect not needed
    mutationSideEffect.takeEffectArgs,
    undefined, // Map loading not needed
    undefined, // Map success not needed
    undefined, // Map failure not needed
    mutationSideEffect.unloadBy
  )
}

export const enhanceSaga = (mutations, saga, sideEffect, runConfig) => {
  const mutationsKeys = Object.keys(mutations)

  return function* withMutationsSaga() {
    yield fork(saga)
    for (let i = 0; i < mutationsKeys.length; i++) {
      const name = mutationsKeys[i]
      const mutation = mutations[name]
      yield fork(makeMutationSaga(mutation, name, sideEffect, runConfig))
    }
  }
}
