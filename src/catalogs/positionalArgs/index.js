import { rj } from '../../rocketjump'

export default rj({
  proxyActions: {
    load: ({ load }) => (...args) => load(args)
  }
})
