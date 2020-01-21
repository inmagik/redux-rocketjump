import { makeLibraryAction } from 'rocketjump-core'

export const makeMutationActionTypeMain = (type, name, mutation) => {
  // NOTE: mutation type can override default mutation type
  if (mutation.type) {
    return mutation.type
  }
  // Create a namespaced name from base rj.type
  return `@RJ/${type}/@MUTATION/${name}`
}

export const makeMutationActionTypeLoading = (type, name, mutation) =>
  makeMutationActionTypeMain(type, name, mutation) + '/LOADING'

export const makeMutationActionTypeSuccess = (type, name, mutation) =>
  makeMutationActionTypeMain(type, name, mutation) + '/SUCCESS'

export const makeMutationActionTypeFailure = (type, name, mutation) =>
  makeMutationActionTypeMain(type, name, mutation) + '/FAILURE'

export const makeMutationActionTypeUnload = (type, name, mutation) =>
  makeMutationActionTypeMain(type, name, mutation) + '/UNLOAD'

export const makeMutationActionTypes = (type, name, mutation) => ({
  main: makeMutationActionTypeMain(type, name, mutation),
  loading: makeMutationActionTypeLoading(type, name, mutation),
  success: makeMutationActionTypeSuccess(type, name, mutation),
  failure: makeMutationActionTypeFailure(type, name, mutation),
  unload: makeMutationActionTypeUnload(type, name, mutation),
})

function makeMutationBuildableActionCreator(type, name, mutation) {
  const mainType = makeMutationActionTypeMain(type, name, mutation)
  const actionCreator = (...params) =>
    makeLibraryAction(mainType, ...params).withMeta({
      params,
    })
  return actionCreator
}

function makeMutationPlainActionCreator(type, name, mutation) {
  const mainType = makeMutationActionTypeMain(type, name, mutation)
  const actionCreator = (params = [], meta = {}) => ({
    type: mainType,
    payload: {
      params,
    },
    meta: {
      ...meta,
      params,
    },
  })
  return actionCreator
}

// Add specials rj mutations action creators to base rj action creators
const createActionCreatorsEnhancer = makeActionCreator => (
  mutations,
  actionCreators,
  runConfig
) => {
  return Object.keys(mutations).reduce((enhancedActionCreators, name) => {
    const mutation = mutations[name]
    const actionCreator = makeActionCreator(runConfig.type, name, mutation)
    if (process.env.NODE_ENV !== 'production' && actionCreators[name]) {
      console.warn(
        `[redux-rocketjump] @mutations WARNING the mutation [${name}] ` +
          `override a pre existing action creator this can leading to ` +
          `unexpected behaviors.`
      )
    }
    return {
      ...enhancedActionCreators,
      [name]: actionCreator,
    }
  }, actionCreators)
}

export const enhanceBuildableActions = createActionCreatorsEnhancer(
  makeMutationBuildableActionCreator
)

export const enhancePlainActions = createActionCreatorsEnhancer(
  makeMutationPlainActionCreator
)
