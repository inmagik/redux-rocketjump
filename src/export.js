import mapValues from 'lodash.mapvalues'
import makeActionTypes from './actionTypes'
// import get from 'lodash.get'

// Make the exports
// take a config and a extended export (the return of this function)
export default (config, extendExport = {}) => {
  const {
    // Action namespace
    namespace,
  } = config

  // Make action types for export
  const actionTypes = makeActionTypes(
    namespace,
    config.actionTypes,
    typeof config.effects !== 'undefined'
      ? Object.keys(config.effects)
      : []
  )

  // // rj namespace ... simply use a slash append at the end of gived namespace
  // const rjNS = `${namespace}/`
  //
  // // Make the actionTypes from config
  // let actionTypes = typeof config.actionTypes === 'function'
  //   ? config.actionTypes(rjNS)
  //   : {}
  //
  // // Merge \w given extended export
  // if (extendExport.actionTypes) {
  //   actionTypes = {
  //     ...extendExport.actionTypes,
  //     ...actionTypes,
  //   }
  // }

  // TODO
  // Make the actions
  const actions = mapValues(config.actions, makeAction => makeAction(
    actionTypes,
    extendExport.actions || {},
    namespace,
  ))

  // TODO
  // Make the reducer

  // TODO
  // Make the selectors

  // Make the final export
  return {
    actionTypes,
    actions,
  }
}
