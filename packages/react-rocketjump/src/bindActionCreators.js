import { EFFECT_ACTION } from './actionTypes'

/**
 * Builder pattern implementation for action creators calls
 * Its only aim is to decouple the invocation and the definition of params needed by the invocation itself
 * It is also the only way to leverage the rocketjump capabilities with full power
 */
function Builder(actionCreator, dispatch, subject) {
  const callbacks = {};
  let builtMeta = {};

  this.withMeta = meta => {
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
    if (action[EFFECT_ACTION] === true) {
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

/**
 * This function is used to attach a builder to an action creator
 * To attach a builder means to add some methods on the function object that reflect the builder class interface
 * in order to have a unique interface. This methods simply create a new builder and call the corresponding method
 * on the builder itself. This is necessary because directly attaching the builder logic to the action creator
 * would lead to some data being reused across advanced calls, and this is not intended to happen.
 * 
 * The run method throws an exception just to give the user a nicer feedback on the error he/she would receive
 *  in case of bad invocation
 */
function attachBuilder(boundActionCreator, actionCreator, dispatch, subject) {
  boundActionCreator.onSuccess = callback => {
    return new Builder(actionCreator, dispatch, subject).onSuccess(callback)
  }
  boundActionCreator.onFailure = callback => {
    return new Builder(actionCreator, dispatch, subject).onFailure(callback)
  }
  boundActionCreator.withMeta = meta => {
    return new Builder(actionCreator, dispatch, subject).withMeta(meta)
  }
  boundActionCreator.run = () => {
    throw new Error('In order to do a plain call without meta, onSuccess or onFailure, just invoke the action creator, use the run method only when you leverage the builder functionalities');
  }
  return boundActionCreator
}

/**
 * Binds a single action creator to the dispatch dynamics, and returns a function able to dispatch
 *  the generated action when invoked
 * 
 * An action creator provided by rocketjump will be dispatched in the context of rocketjump side effect model,
 *  while a standard plain action will be directly sent to the reducer
 * 
 * Every action is attached a builder in order to allow for calling with more options
 * 
 * By default, arguments passed directly to the function are sent in the `params` property of the action
 * If there is the need to attach some metadata or some callbacks to the action, the action must be dispatched
 *  using the builder. It is important to underline that the builder works only on rocketjump async actions
 *  (i.e. the predefined actions plus all the overrides obtained with the `actions` directive in configuration).
 *  If builder methods are invoked on plain actions, they'll simply have no effect.
 * 
 * Hence, it is possible to dispatch an action in two ways, described by the following example (in which the action
 *  is called action)
 * 
 * Basic call: 
 * action(arg1, arg2, arg3, ...)
 * 
 * Advanced call: 
 * action
 *   .withMeta({ meta1: value1, meta2: value2 })
 *   .withMeta({ meta3 : value3 })
 *   .onSuccess(successHandler)
 *   .onFailure(failureHander)
 *   .run(arg1, arg2, arg3, ...)
 * 
 * The basic call has no way to leverage `meta`, `onSuccess` or `onFailure` features provided by the library
 * 
 * In the advanced call it is possible to call the three methods `withMeta`, `onSuccess` and `onFailure` in 
 *  any order and even more than one time: metadata are merged using JS plain object merging, and the callbacks
 *  are overwritten. It is mandatory that the last method of the call is the `run` method, which takes the 
 *  arguments to be passed to the action creator. Apart from the `run` method, the advanced call must contain
 *  at least one other method among those documented here in order to be valid. In other words, the call
 * 
 *  action.run(arg1, arg2, arg3)
 * 
 *  is not valid in will raise an exception. It is in fact meaningless to dispatch an action in this way, since
 *  it would be semantically equivalent but more verbose with respect to the direct call action(arg1, arg2, arg3)
 * 
 */
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

/**
 * This function is used to bind action creators to the dispatch dynamics
 * The user will be returned a function that, when invoked, will care of dispatching 
 *  the corresponding action
 * 
 * Both plain actions and rocketjump actions can be bound in this way
 */
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
