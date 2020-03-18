import { isObjectRj as coreIsObjectRj } from 'rocketjump-core'
import { rj } from './rocketjump'

export function isObjectRj(objRj) {
  return coreIsObjectRj(objRj, rj)
}
