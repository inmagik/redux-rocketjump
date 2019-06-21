---
id: composition
title: Composing RocketJumps
sidebar_label: Composition
---

## Composition as a way to reuse code

RocketJumps can be merged!

As stated in the initial part of the API description, the `rj` function can take several arguments, each of which can be a fresh configuration or the output of a previous call. Calling `rj` with several arguments is interpreted as a composition will.

```js
const rj1 = rj({
  /* config 1 */
})

const rj2 = rj({
  /* config 2 */
})

const __GENERATED__ = rj(rj1, rj2, {
  /* last config */
})()
```

Rocketjump is thought with the composition in mind, hence a rocketjump can be called with one or more partially evaluated rocketjumps or configurations to be composed together.

## How does composition work?

### Preamble: multiple configuration objects passed in the same call

This is the most simple case of composition, since it is managed via native object merging, like in the following example

```js
const config1 = {
  /* ... config ... */
}
const config2 = {
  /* ... config ... */
}

// The following two invocations yield exactly the same result
rj(config1, config2)
rj({ ...config1, ...config2 })
```

Due to this behaviour, in the following paragraphs we will only deal with one configuration object.

### Generic composition

Consider the following example

```js
const rj0 = rj({
  /* config R */
})
const rj1 = rj(rj0, {
  /* config O */
})
const rj2 = rj({
  /* config C */
})
const rj3 = rj(rj1, rj2, {
  /* config K */
})
const generated = rj3()
```

The composition order goes from top to bottom and from left to right. Hence, in our example, we have the following composition order: `config R > config O > config C > config K`.

First of all, actions, selectors and reducer are generated from `type` and `state` taken from the last configuration object `config K` in our example). Then the composition tree is traversed:

- `actions` and `selectors` are evaluated in composition order, and the result is recursively merged: the `actions` attribute of configO can use the actions generated by the property `actions` in configR, and so on. The same holds for selectors.
- `reducer` attributes are applied recursively in composition order. In our example the final reducer will be the output of `reducerK(reducerC(reducerO(reducerR(defaultReducer))))`
- `dataReducer`, `effectCaller`, `takeEffect` and `takeEffectArgs` attributes are not merged, and only the latest in the composition tree is applied. Composition order is, as usual, increasing from top to bottom and from left to right. In our example, the order of precedence would be `config K > config C > config O > config R`. Moreover, `dataReducer` is applied before `reducer`.
- `effectExtraParams`, `successEffect` and `failureEffect` generators are chained in composition order
- `api` must be defined only in the last configuration object, along with `type` and `state`