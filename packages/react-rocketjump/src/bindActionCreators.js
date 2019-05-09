import { EFFECT_ACTION } from './actionTypes'

function Builder(actionCreator, dispatch, subject) {
  const callbacks = {};
  let builtMeta = {};

  this.meta = meta => {
    builtMeta = {
      ...builtMeta,
      ...meta
    }
    return this
  }

  this.onSuccess = callback => {
    callbacks.onSuccess = callback
    return this
  }

  this.onFailure = callback => {
    callbacks.onFailure = callback
    return this
  }

  this.run = (...args) => {
    let action = actionCreator(...args)
    console.log(action)
    if (action[EFFECT_ACTION] === true) { // redundant
      action = action.extend({
        meta: builtMeta, 
        callbacks,
      })
      delete action.extend
      delete action.withMeta
      console.log(action)
      subject.next(action)
    }
    dispatch(action)
  }
  
  return this
}

// This is a copy-paste of old school bindActionCreators of redux
// in addition when an action is marked as an "effect" action
// is emitted to subject

function attachBuilder(boundActionCreator, actionCreator, dispatch, subject) {
  boundActionCreator.onSuccess = callback => {
    return new Builder(actionCreator, dispatch, subject).onSuccess(callback)
  }
  boundActionCreator.onFailure = callback => {
    return new Builder(actionCreator, dispatch, subject).onFailure(callback)
  }
  boundActionCreator.meta = meta => {
    return new Builder(actionCreator, dispatch, subject).meta(meta)
  }
  return boundActionCreator
}

function bindActionCreator(actionCreator, dispatch, subject) {
  const out = (...args) => {
    const action = actionCreator(...args)
    console.log(action)
    if (action[EFFECT_ACTION] === true) {
      delete action.extend
      delete action.withMeta
      subject.next(action)
    }
    dispatch(action)
  }
  return attachBuilder(out, actionCreator, dispatch, subject)
}

export default function bindActionCreators(actionCreators, dispatch, subject) {
  const boundActionCreators = {}
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key]
    boundActionCreators[key] = bindActionCreator(
      actionCreator,
      dispatch,
      subject
    )
  }
  return boundActionCreators
}
