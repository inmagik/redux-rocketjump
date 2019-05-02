import { forgeRocketJump } from 'rocketjump-core'
import makeExport from './export'
import createMakeRxObservable from './createMakeRxObservable'

// Don't needed
function makeRunConfig(finalConfig) {
  return null
}

const $TYPE_RJ_PARTIAL = 23

function makeRecursionRjs(partialRjsOrConfigs, extraConfig, isLastRjInvocation) {
  let hasEffectConfigured = !isLastRjInvocation
  const rjsOrConfigs = partialRjsOrConfigs.map(config => {
    if (typeof config === 'function') {
      // A Partial RJ
      if (config.__rjtype === $TYPE_RJ_PARTIAL) {
        return config
      } else {
        // Use as EFFECT Call
        hasEffectConfigured = true
        return {
          effect: config,
        }
      }
    }
    hasEffectConfigured = hasEffectConfigured || typeof config.effect === 'function'
    return config
  })

  if (!hasEffectConfigured) {
    throw new Error(`[react-rj] the effect option is mandatory.`)
  }

  return rjsOrConfigs
}

function finalizeExport(finalExport, runConfig, finalConfig) {
  // ~~ END OF RECURSION CHAIN  ~~
  const { sideEffect, ...rjExport } = finalExport

  // Creat the make rx observable fn using merged side effect descriptor!
  const makeRxObservable = createMakeRxObservable(sideEffect)

  // Finally the rocketjump runnable state is created!
  /*
    {
      reducer: fn,
      actionCreators: {},
      makeSelectors: fn,
      makeRxObservable: fn,
    }
  */
  return {
    ...rjExport,
    makeRxObservable,
  }
}

const reactRjImpl = {
  makeRunConfig,
  makeRecursionRjs,
  makeExport,
  finalizeExport,
}

const rj = forgeRocketJump(reactRjImpl)

function adjustConfig(c) {
  if (typeof c === 'function') {
    return c
  }
  return {
    effect: c.api,
    reducer: c.proxyReducer,
  }
}

rj.fromReduxRj = reduxRj => {
  const proxyImpl = { ...reactRjImpl }

  proxyImpl.makeRecursionRjs = (partialRjsOrConfigs, ...args) => {
    const proxyRjs = partialRjsOrConfigs.map(adjustConfig)
    return reactRjImpl.makeRecursionRjs(proxyRjs, ...args)
  }

  return reduxRj(undefined, undefined, proxyImpl)
}

export default rj
