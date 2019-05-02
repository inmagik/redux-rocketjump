// Redux Rj internal types

// The redux-rocketjump run config
// to be used in recursions rjs to correct extends
// reducer and so on ...
// partialRj(runConfig)
export const $TYPE_RJ_RUN_CONFIG = Symbol('rj')

// A special config injected by combineRjs
// rj()({ /* injected by combine */ })
export const $TYPE_RJ_COMBINE_CONFIG = Symbol('rj~combine')
