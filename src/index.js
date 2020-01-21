import * as standardMutations from './mutations/standard'
import { rj } from './rocketjump'

// MagIK DeBps for useRunRj hook from rj core!
export { deps } from 'rocketjump-core'

// The magIK rj() constructor
// ... with some extra helpers on it ...
rj.mutation = { ...standardMutations }
export { rj }

export * from './helpers'
export * from './effects'
export * from './reducer'
export * from './selectors'
export * from './actions'
export * from './hooks'
export { default as combineRjs } from './combineRjs'
export { default as rjMiddleware } from './rjMiddleware'
