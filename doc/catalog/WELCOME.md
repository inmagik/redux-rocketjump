```image
src: catalog_logo.svg
plain: true
```

Hi!

Welcome to your freshly set up Catalog. To get started immediately, check out the `catalog/` directory (or wherever you've set it up).

BELLA!
X
- `WELCOME.md`: This Markdown document
- `index.js`: The entry file to start Catalog. Change configuration and add pages here.
- `index.html`: The HTML document which gets served. Usually there's no need to edit this unless for example you want to load a custom font.
- `static/`: A directory with files that are served statically. For example the Catalog logo above.

For more details about how to use Catalog, check out the [documentation](https://docs.catalog.style/).

# redux-rocketjump
[![Build Status](https://travis-ci.org/inmagik/redux-rocketjump.svg?branch=master)](https://travis-ci.org/inmagik/redux-rocketjump)
[![npm version](https://badge.fury.io/js/redux-rocketjump.svg)](https://badge.fury.io/js/redux-rocketjump)

Rocketjump your redux! Speed up redux-app development.

A set of tools to speed up the development of an a redux based app:

- Generate all you need from and for the state from a single function call, easy to extend, easy to compose.
- An out of the box way to organize redux folders by functionality instead of type.
- Handy helpers to help you compose functionality.

```js
import { rj, makeAppsReducers, makeAppsSaga } from 'redux-rocketjump'

// state/index.js
import * as todos from './todos'

const APPS = {
  todos,
}

const rootReducer = combineReducers({
  ...makeAppsReducers(APPS),
})

const mainSaga = makeAppsSaga(APPS)

// state/todos.js
const moreStuffRj = rj({
  proxyActions: {
    loadMore: ({ load }) => (params = {}, meta = {}) =>
      load(params, { ...meta, more: true }),
  },
  dataReducer: (prevState, { type, payload, meta }) =>
    meta.more ? prevState.concat(payload.data) : payload.data
})

const toastOnFailureRj = rj({
  failureEffect: function *(error) {
    yield put(showErrorToast(`Sorry our monkeys are trying to do their best, ${error.message}`))
  }
})

const callAuthenticatedRj = rj({
  callApi: function *(apiFn, ...args) {
    const token = yield select(getAuthToken)
    const result = yield call(apiFn, ...args, token)
    return result
  }
})

export const {
  actions: { load: loadTodos, unload: unloadTods, loadMore: loadMoreTodos },
  selectors: { getData: getTodos, isLoading: isLoadingTodos, getError: getTodosError },
  saga,
  reducer,
} = rj(moreStuffRj, toastOnFailureRj, callAuthenticatedRj)({
  type: 'GET_TODOS',
  state: 'todos',
  api: fetchTodosFromApi,
  proxySelectors: {
    getData: ({ getData }) => createSelector(getData, todos =>
      todos === null ? null : todos.map(todo => ({
        ...todo,
        asReadMe: `* [${todo.done ? 'v' : ''}] ${todo.title}`
      }))
    )
  },
})

```

## Install

```
yarn add redux-rocketjump
```
or
```
npm install --save redux-rocketjump
```

## Install peer dependencies

redux-rocketjump uses [redux-saga](https://github.com/redux-saga/redux-saga) to handle side effects,
and [reselect](https://github.com/reactjs/reselect) to make ad hoc memoized selectors.
```
yarn add redux redux-saga reselect
```
or
```
npm install --save redux redux-saga reselect
```

## Why?

When develop a large redux app with a lot of entities is some cases this can lead to a lot of copy-paste code an in a difficult to share functionality, redux-rocketjump try to bridge this gap promoting better code organization and
automating certain stuff without loosing control of what you are doing.

## Organize redux code by functionality
When starting writing a redux app is common to organize code by type Es:. (actions, reducers, selectors, ...).
But when the app get bigger this approach lead to confusion, unmantenibility and in a difficult scalability.
So instead yuo should organizing state folders by what they does Es:. (todos, users, tickets, ...).

To do this `redux-rocketjump` offers you two covenient helpers `makeAppsReducers` and `makeAppsSaga`.

Every state folder should export a `reducer` injected into the main reducer and, if needed, a `saga` used to handle side effects.

A tipical `state/index.js` looks like this:
```js
import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { makeAppsReducers, makeAppsSaga } from 'redux-rocketjump'
import * as todos from './todos'

const APPS = {
  todos,
}

const rootReducer = combineReducers({
  // HOOK for other reducers...
  ...makeAppsReducers(APPS),
})

const mainSaga = makeAppsSaga(APPS)

const preloadedState = undefined
const sagaMiddleware = createSagaMiddleware()
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  rootReducer,
  preloadedState,
  composeEnhancers(
    applyMiddleware(sagaMiddleware),
  )
)

sagaMiddleware.run(mainSaga)

export default store
```

## Your first rocketjump
Basically `rocketjump` is just a function that makes action creators, selectors, reducer
and saga from a configuration.
The minum options are:
- `type`: The action type that trigger side effect and the prefix for related action types dispatched: `type`_LOADING, `type`_SUCCESS, `type`_FAILURE, `type`_UNLOAD.
- `state`: The base selector for generated selectors, can be a selector, a function or a string object path with the sintax of https://lodash.com/docs/#get. If `false` was given the reducer and selectors creation is skipped, this is useful when you need only to run action driven side effect in rocketjump environment.
- `api`: the side effect, a function that return a promise.

So this is a `rocketjump` for fetching some todos from an API:
```js
// todos.js
import { rj } from 'redux-rocketjump'
export const {
  actions: {
    // Trigger side effect
    // the first parameter is an object that is passed as argument to the api function
    // the second paramter is an object of meta dispached along with all the action dispatched
    // you can use meta to customize reducer or saga behaviour from outside.
    load: loadTodos,
    // Stop side effect and clear the state, accept an object of meta as paramater
    unload: unloadTods,
  },
  selectors: {
    // Promise resolved value
    getData: getTodos,
    // Promise is running?
    isLoading: isLoading,
    // The promise rejection
    getError: getTodsError,
  },
  // The generated reducer
  reducer,
  // The generated saga
  saga,
} = rj({
  type: 'GET_TODOS',
  state 'todos',
  api: params => loadTodosFromApi(params),
})()
```
This the equivalent without using rocketjump:

```js
// reducer.js
const defaultState = { loading: false, error: null, data: null  }
export default (prevState = defaultState, { type, payload }) => {
  switch (type) {
    case 'GET_TODOS_LOADING':
      return {
        ...prevState,
        loading: true,
        error: null,
      }
    case 'GET_TODOS_FAILURE':
      return {
        ...prevState,
        loading: false,
        error: payload,
      }
    case 'GET_TODOS_SUCCESS':
      return {
        ...prevState,
        loading: false,
        data: payload.data,
      }
    case 'GET_TODOS_UNLOAD':
      return {
        ...prevState,
        ...defaultState,
      }
    default:
      return prevState
  }
}
```

```js
// actions.js
export const loadTodos = (params = {}, meta = {}) => ({
  type: 'GET_TODOS'
  payload: {
    params,
  },
  meta,
})

export const unloadTodos = (meta = {}) => ({
  type: 'GET_TODOS_UNLOAD',
  meta
})
```

```js
// selectors.js
export const getData = state => state.todos.data
export const isLoading = state => state.todos.loading
export const getError = state => state.todos.error
```

```js
// saga.js
import { call, put, takeLatest } from 'redux-saga/effects'

function* fetchTodos({ payload: { params }, meta }) {
  yield put({ type: 'GET_TODOS_LOADING', meta })

  try {
    const data = yield call(loadTodosFromApi, params)
    yield put({ type: 'GET_TODOS_SUCCESS', meta, payload: { data, params } })
  } catch (error) {
    yield put({ 'GET_TODOS_FAILURE', meta, error: true, payload: error })
  }
}

export default function* () {
  yield takeLatest('GET_TODOS', fetchTodos)
}
```

## Extend the base rocketjump
The base rocketjump can be extendend to change how the reducer work, make new action creators, customize selectors and more.
Here the complete list of available options:

- `proxyActions`: An hook to proxy action creators, if an object is given every keys is used to generate new action creator, every value is called with all the previous generated action creators and the returned value is expcted to be the new action creator. Previous action creators will be merged with the given new action creators. If function is given, the return value will be used directly to be merge to the previous actions creators.
- `proxySelectors`: Works exactly as `proxyActions` but is used to proxy selectors.
- `dataReducer`: If given is used as a sub reducer to handle the `type_SUCCESS ` action on the piece of state related to data.
The default implentation is: `(prevState, { type, payload }) => payload.data`
- `proxyReducer`: If given, is expected to be a function, it will be called with the previous reducer and the result is used as the new reducer.
- `apiExtraParams`: If given, is expected to be a generator, it will be called from a saga with the params coming from the action creator and is used to provide extra paramaters to the `api` function. The return value is expected to be an object it will be merged with the actually `api` paramaters. Here you can use all the `redux-saga` effects, so you can even run asynchronous code. You can even pass an array of generators.
- `callApi`: If given is used instead of the `call` function from `redux-saga` to call the `api` function.
- `successEffect`: A generator called only when the promise returned from `api` resolves. It receives the resolved value and the meta from the action creator. You can even pass an array of generators.
- `failureEffect`: A generator called only when the promise returned from `api` reject. It receives the rejection and the meta from the action creator. You can even pass an array of generators.
- `takeEffect`: The effect that describe how the task spawned by the main action type is handled. The default value is `takeLatestAndCancel` that spawn a task every time the main action type is dispatched and cancel any previous tasks, this is usally the best choice for GET api requests.
If you need a different behaviours of you can choose one from [src/effects](https://github.com/inmagik/redux-rocketjump/blob/master/src/effects.js), or you can implement a new one.
- `takeEffectArgs`: Extra arguments passed to `takeEffect`.

Here some examples to use theese options to handle common tasks.

Rocketjump that add auth to your api calls:
```js
import { rj } from 'redux-rocketjump'
import { select, call } from 'redux-saga/effects'

const rjAuth = rj({
  callApi: function *(apiFn, ...args) {
    const token = yield select(state => state.auth.accessToken)
    const result = yield call(apiFn, ...args, token)
    return result
  }
})

```

Rocketjump that load more stuff from a paginated api:
```js
import { rj, getOrSelect } from 'redux-rocketjump'
import { select } from 'redux-saga/effects'

const rjLoadMore = (config, ...args) = rj({
  apiExtraParams: function (params, meta) {
    if (meta.loadMore) {
      const next = yield select(getOrSelect(state, config.state).pagination.next)
      return { next }
    }
  }
})(config, ...args)
```

Rocketjump that show a message on success:
```js
import { rj } from 'redux-rocketjump'
import { put } from 'redux-saga/effects'

const rjOkMsg = rj({
  successEffect: function (data, meta) {
    if (meta.successMessage) {
      yield put(showSuccessMessage(meta.successMessage))
    }
  }
})
```

## Compose rocketjumps

Rocketjump is thought with the composition in mind, a rocketjump can be called with one or a list of partial evaluated rocketjumps or configurations. Only when a rocketjump is called the second time reducer, actions, saga and selectors are created. All the given partial evaluated rocketjumps or configurations are composed together.

Take the following pseudo-code:

```js
const rj1 = rj({ /* config */ })

const rj2 = rj({ /* config */ })

const { /* actions, reducers, ... */ } = rj(
  rj1,
  rj2,
  {/* config */ },
)({ /* config */  })
```

When you call the last rocketjump the second time actions, reducer, actions and selectors are created using rj1 after they are passed to rj2 which generates new ones and so on.

Regarding the saga it can't be composed as the others, instead all the extra parameters generated by the `apiExtraParams` are merged together recursively and the effects of `successEffect` or the `failureEffect` are runned consecutively.

## Handy helpers
redux-rocketjump exports two handy helpers `composeReducers` and `resetReducerOn` to help you composin rocketjumps reducers behaviours, here an example:
```js
import { rj, resetReducerOn, composeReducers, makeActionTypes } from 'redux-rocketjump'

const rjCountFails = (config = {}, ...args) => rj({
  proxyReducer: r => {
    const actionTypes = makeActionTypes(config.type)
    return composeReducers(r, (prevState = { failureCount: 0 }, { type, payload }) => {
      switch (type) {
        case actionTypes.failure:
          return {
            ...prevState,
            failureCount: prevState.failureCount + 1,
          }
        case actionTypes.unload:
          return {
            ...prevState,
            failureCount: 0,
          }
        default:
          return prevState
      }
    })
  }
})(config = {}, ...args)

const rjResetOnLogout = rj({
  proxyReducer: r => resetReducerOn('LOGOUT', r),
})
```

## Catalogs
Out of the box there are some useful "catalogs" that you can use in composition with rocketjump to extend the base functionality.

### Promise
This catalog add promise to action creator using the awesome library [redux-saga-thunk](https://github.com/diegohaz/redux-saga-thunk).
```js
import rjWithPromise from 'redux-rocketjump/catalogs/promise'
const {
  actions: {
    load,
  },
  saga,
 } = rj(rjWithPromise)({
  type: 'GET_TODOS',
  state: 'todos',
  api: loadTodosFromApi,
})

// ... next ...
store.dispatch(load())
  .then(() => /* ... */)
  .catch(() => /* ... */)

```


## Example
You can find an example under [example](https://github.com/inmagik/redux-rocketjump/tree/master/example), it's a simple REST todo app that uses the great [json-server](https://github.com/typicode/json-server) as fake API server.

To run it first clone the repo:
```
git clone git@github.com:inmagik/redux-rocketjump.git
```

Then run:
```
yarn install
yarn start
```
Or using npm:
```
npm install
npm start
```
