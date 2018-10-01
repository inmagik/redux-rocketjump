import mapValues from 'lodash.mapvalues'
import get from 'lodash.get'
// config
// ---> namespace
// ---> state
// ---> actionTypes
//
// export
// actionTypes
const makeExport = (config, extendExport = {}) => {
  const {
    // Action namespace
    namespace,
  } = config

  // Make the actionTypes from config
  let actionTypes = config.actionTypes(namespace)
  // Merge \w given extended export
  if (extendExport.actionTypes) {
    actionTypes = {
      ...extendExport.actionTypes,
      ...actionTypes,
    }
  }

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

export default (...args) => {
  const [ baseConfig, ...rjs ] = [...args].reverse()

  return (runConfig, extendExport) => {
    const config = {
      ...runConfig,
      ...baseConfig,
    }

    const combinedExport = rjs.reduce((finalExport, rj) => {
      return rj(config, finalExport)
    }, extendExport)

    return makeExport(config, combinedExport)
  }
}
