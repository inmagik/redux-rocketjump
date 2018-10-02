import makeExport from './export'

// Here is where the magic starts the functional recursive rjs combining \*.*/
export default (...args) => {
  // Take the last arguments of rj invocation as base config:
  /*
    rj(
      // List of extends rjs
      rj(...),
      rj(...),
      // Expected to be a config plain object
      {
        ...
      }
  )
  */
  const [ baseConfig, ...rjs ] = [...args].reverse()

  return (runConfig, extendExport) => {
    // Merged the base rj config with the finally invokation config
    // can be undefined
    const config = {
      ...runConfig,
      ...baseConfig,
    }

    // Invoke all rjs and merge returned exports
    // ... yeah a mindfuck but is coool. ..
    const combinedExport = rjs.reduce((finalExport, rj) => {
      return rj(config, finalExport)
    }, extendExport)

    // Make the exports
    return makeExport(
      config,
      combinedExport,
      // when extendExport is undefined we really "create" the export
      // (otherewise the rj is using to extending another rj...)
      // so basically this means that we can create the saga from
      // the side effect descriptor
      typeof extendExport === 'undefined',
    )
  }
}
