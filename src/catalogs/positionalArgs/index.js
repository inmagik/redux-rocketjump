import { rj } from '../../rocketjump'

const makeMeta = (toMeta, args) => toMeta.reduce((meta, metaName, i) => {
  if (!metaName || args.length <= i) {
    return meta
  }
  return { ...meta, [metaName]: args[i] }
}, {})

export default (...toMeta) => rj({
  proxyActions: {
    load: ({ load }) => (...args) => {
      const meta = toMeta ? makeMeta(toMeta, args) : {}
      return load(args, meta)
    }
  }
})
