## 3.0.0

###### _March X, 2020_

#### :rotating_light: Changes

- `Actions`

This new major version has improved the stablity of `rocketjump` ecosystem,
this version brings all the loved :heart: features from
[react-rocketjump](https://inmagik.github.io/react-rocketjump) to
`redux-rocketjump`.

So, for a relaxed migration the old `load` and `unload` action creations
still in place with the same signature when using `actions` from `RjObject`.

We only adjust the signature of base `run` and `clean` action creators:

```js
run(params = [], meta = {}) => ({
  type,
  meta,
  payload: {
    params
  }
})
```

```js
clean(params = [], meta = {}) => ({
  type,
  meta,
  payload: {
    params
  }
})
```

When we used `hooks` (you can read more below),
the signature of `run` and `clean` is different.
Under the hood `RjObject` return also `buildableActions`
with this different signature:

```js
run(...params) => ({
  type,
  meta,
  payload: {
    params,
  }
})
```

```js
clean(...params) => ({
  type,
  meta,
  payload: {
    params,
  }
})
```

The params passed to `run` action creator are directly spread to
`effect` function.

Thanks to _Builder_ you can set the `meta` with the special `withMeta` method.
You can learn more about _Builder_
[here](https://inmagik.github.io/react-rocketjump/docs/usage_actions#rich-way-using-the-builder).

Plus, a new smart action action creator `updateData` has been added
to base action creators.
With `updateData` action creator you can directly change the `data`
of your state.

```js
updateData(newData) => ({
  type,
  payload: newData,
})
```

- `combineRjs` now returns also `RjObjects`:

  ```js
  const {
    rjs: { users: ReduxUsers, todos: ReduxTodos },
    reducer,
    saga,
  } = combineRjs(
    {
      users: rj({
        type,
        effect,
      }),
      todos: rj({
        type,
        effect,
      }),
    },
    {
      state: 'mystatepath',
    }
  )
  ```

- `takeEffect` now **CAN** be a string here's the mapping between strings and generators (you can still use generators directly):

  ```js
  {
    'latest': takeLatestAndCancel,
    'every': takeEveryAndCancel,
    'exhaust': takeExhaustAndCancel,
    'groupBy': takeLatestAndCancelGroupBy,
    'groupByExhaust': takeExhaustAndCancelGroupBy,
  }
  ```

  ```js
  const RjObject = rj({
    type: 'MY_TYPE',
    state: 'mypath',
    takeEffect: 'every',
    effect: () => myApi(),
  })()
  ```

- `composeReducer` now can be directly a function but can still be an array of composing reducers.

#### :zap: New Features

#### Hooks

The main features of `rj` v3 are hooks.

- `useRjActions(RjObject)`

  This hook return an object with bound action creators of given `RjObject`.

  ```js
  const { run, clean, updateData } = useRjActions(RjObject)
  ```

  _NOTE_

  To enable _Builder_ `onSuccess`, `onFailure` and `asPromise` features
  you have to install the rj `middleware`:

  ```js
  import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
  import createSagaMiddleware from 'redux-saga'
  import {
    makeAppsReducers,
    rjMiddleware,
    makeAppsSaga,
  } from 'redux-rocketjump'
  import * as todos from './todos'

  const APPS = {
    todos,
  }

  const rootReducer = combineReducers({
    // HOOK for other reducers
    // specialPath: specialReducer,
    ...makeAppsReducers(APPS),
  })

  const mainSaga = makeAppsSaga(APPS)

  const preloadedState = undefined
  const sagaMiddleware = createSagaMiddleware()
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const store = createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(applyMiddleware(sagaMiddleware, rjMiddleware))
  )

  sagaMiddleware.run(mainSaga)
  ```

- `useRjState(RjObject, mapState)`

  This hook return the state of given `RjObject` you can give a function
  to transform the selected state.

  ```js
  const { data: todos } = useRjState(RjObject)
  // or
  const todos = useRjState(RjObject, (state, selectors) =>
    selectors.getData(state)
  )
  ```

- `useRj(RjObject, mapState)`

  This hooks combine `useRjState` and `useRjActions` and return an
  array with state and actions.

  ```js
  const [{ data: todos }, { run: fetchTodos }] = useRj(RjObject)
  ```

- `useRunRj`

  This hook auto run your `RjObject` according to `deps`.
  You can learn more [here](https://inmagik.github.io/react-rocketjump/docs/connect_userunrj)

#### Computed

#### Mutations

#### `isObjectRj`

## 2.0.0

###### _June 21, 2019_

#### :warning: Deprecation

- The config in second invocation of `rj` is deprecated, don't do this:

```js
rj({
  /* config */
})({
  /* config */
})
```

- The `combineRjs` plugin now is a part of the core.

You can still import this from plugins but is deprecated, instead do this:

```
import { combineRjs } from 'redux-rocketjump`
```

- `api` rj config option was renamed to `effect`
- `proxyActions` rj config option was renamed to `actions`
- `proxyReducer` rj config option was renamed to `reducer`
- `proxySelectors` rj config option was renamed to `selectors`
- `callApi` rj config option was renamed to `effectCaller`
- `apiExtraParams` rj config option was renamed to `effectExtraParams`

#### :zap: New Features

- redux rocketjump 2 use the [rocketjump-core](https://github.com/inmagik/rocketjump-core) a complete rewrite version of the original rj recursion algorithm.
- Now the `reducer` rj config option accept a second parameter:
  the current run configuration (`effect`, `state`, `type`)

```js
const rjImproveReducer = rj({
  reducer: (oldReducer, { type, state, type }) => /* improve reducer with type */,
})
```

## 1.7.2

###### _February 11, 2019_

- Fixed a bug with `unloadBy` and `state` options setted to `false`

## 1.7.1

###### _October 12, 2018_

- Added `makeAddListReducer` to `hor` plugin

## 1.7.0

###### _October 3, 2018_

- Added `unloadBy` to `rj` API a list of actions to unload the side effect and reset the reducer

## 1.6.0

###### _September 6, 2018_

- Rename `catalogs` to `plugins`
- Added `cache` plugin
- Added `needEffect` to `rj` API a saga effect to determinate if run api.

## 1.5.0

###### _August 24, 2018_

- The `takeLatestAndCancelGroupBy` effect clear all pending tasks when match cancel pattern \w null key
- Added new core option `composeReducer` to `rj` that expect an array of reducers to compose to current reducer.
- Added map catalog to handle map like data.
- Added update catalog to handle multi update entities.
- Added delete catalog to handle deleting entities.

## 1.4.1

###### _August 24, 2018_

- Workaround in promise catalog to avoid bug \w React Native

## 1.4.0

###### _August 23, 2018_

- Added list catalog to make a paginated list `rj`
- Added hor catalog with some HORs (higher-order reducer)

## 1.3.0

###### _April 11, 2018_

- You can now pass `false` to `rj` `state` param to omit reducer creation, util when you need only to
  run action driven side effect in rocketjump environment.
- Added a `config` property to `rj` with the configuration of rocketjump.

## 1.2.0

###### _April 11, 2018_

- Api function can be invoked through positional arguments instead of an object.
- Added _positionalArgs_ rj catalog to call the `load` actionCreator with positional arguments params.

## 1.1.0

###### _April 10, 2018_

- Added the first _catalog_! The _promise_ catalog that transform the `load` action creator in to a promise using
  the awesome [redux-saga-thunk](https://github.com/diegohaz/redux-saga-thunk).
- Pubblished flat directories to npm.
- Changed the base reducer set the error state using `payload` key instead of the `error` key.
- Dispatched `{ type, payload: error, error: true }` intstead of `{ type, error }` on failure.
- Added the `mapLoadingAction` rj config option to map the action dispatched on loading.
- Added the `mapFailureAction` rj config option to map the action dispatched on failure.
- Added the `mapSuccessAction` rj config option to map the action dispatched on success.
