# redux-rocketjump
Rocketjump your redux! Speed up redux-app development.

A set of tools to speed up the devlopment of an a redux based app:

- Generate all you need from and for the state from a single function call, easy to extend, easy to compose.
- An out of the box way to organize redux folders by functionality instead of type.
- Handy helpers to help you compose functionality.

```js
import { rocketjump, makeAppsReducers, makeAppsSaga } from 'redux-rocketjump'

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
const moreStuffRj = rocketjump({
  proxyActions: {
    loadMore: ({ load }) => (params = {}, meta = {}) =>
      load(params, { ...meta, more: true }),
  },
  dataReducer: (prevState, { type, payload, meta }) =>
    meta.more ? prevState.concat(payload.data) : payload.data
})

const toastOnFailureRj = rocketjump({
  failureEffect: function *(error) {
    yield put(showErrorToast(`Sorry our monkeys are trying to do their best, ${error.message}`))
  }
})

const callAuthenticatedRj = rocketjump({
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
} = rocketjump(moreStuffRj, toastOnFailureRj, callAuthenticatedRj)({
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
To do this redux-rocketjump offers you two covenient helpers `makeAppsReducers` and `makeAppsSaga`.
Every state folder should export a `reducer` key with the reducer injected into the main reducer and, if needed, a `saga` key used to handle side effects.

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
- `type`: The action type that trigger side effect and the prefix for related action types (type_LOADING, type_SUCCESS, type_FAILURE, type_UNLOAD).
- `state`: The base selector for generated selectors, can be a string with the sintax of https://lodash.com/docs/#get
- `api`: the side effect, a function that return a promise.

So this is a `rocketjump` for fetching some todos from an API:
```js
// todos.js
import { rocketjump } from 'redux-rocketjump'
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
} = rocketjump({
  type: 'GET_TODOS',
  state 'todos',
  api: params => loadTodosFromApi(params),
})()
```
## Extend the base rocketjump
The base rocketjump can be extendend to change how the reducer work, make new action creators, customize selectors and more.
Here the complete list of available options:

- `proxyActions`: An hook to proxy action creators, if an object is given every keys is used to generate new action creator, every value is called with all the previous generated action creators and the returned value is expcted to be the new action creator. Previous action creators will be merged with the given new action creators. If function is given, the return value will be used directly to be merge to the previous actions creators.
- `proxySelectors`: Works exactly as `proxyActions` but is used to proxy selectors.
- `dataReducer`: If given is used as a sub reducer to handle the `type_SUCCESS ` action on the piece of state related to data.
The default implentation is:
```
(prevState, { type, payload }) => payload.data
```
- `proxyReducer`: If given, is expected to be a function, it will be called with the previous reducer and the result is used as the new reducer.
- `apiExtraParams`: If given, is expected to be a generator, it will be called from a saga with the params coming from the action creator and is used to provide extra paramaters to the `api` function. The return value is expected to be an object it will be merged with the actually `api` paramaters. Here you can use all the `redux-saga` effects, so you can even run asynchronous code. You can even pass an array of generator.
- `callApi`: If given is used instead of the `call` function from `redux-saga` to call the `api` function.
- `successEffect`: A generator called only when the promise returned from `api` resolves. It receives the resolved value and the meta from the action creator. You can even pass an array of generator.
- `failureEffect`: A generator called only when the promise returned from `api` reject. It receives the rejection and the meta from the action creator. You can even pass an array of generator.
- `takeEffect`: The effect that describe how the task spawned by the main action type is handled. The default value is `takeLatestAndCancel` that spawn a task every time the main action type is dispatched and cancel any previous task, this is usally the best choice for GET api requests. 
If you need a different behaviours of you can choose one from [src/effects](https://github.com/inmagik/redux-rocketjump/blob/master/src/effects.js), or you can implement a new one.
- `takeEffectArgs`: Extra arguments passed to `takeEffect`.

Here some examples to use theese options to handle common tasks.

Adding auth to your api calls:
```js
import { rocketjump } from 'redux-rocketjump'
import { select, call } from 'redux-saga/effects'

const rj = rocketjump({
  callApi: function *(apiFn, ...args) {
    const token = yield select(state => state.auth.accessToken)
    const result = yield call(apiFn, ...args, token)
    return result
  }
})

```

Load more stuff from a paginated api:
```js
import { rocketjump, getOrSelect } from 'redux-rocketjump'
import { select } from 'redux-saga/effects'

const rj = (config, ...args) = rocketjump({
  apiExtraParams: function (params, meta) {
    if (meta.loadMore) {
      const next = yield select(getOrSelect(state, config.state).pagination.next)
      return { next }
    }
  }
})(config, ...args)
```

Show a popup on success:
```js
import { rocketjump } from 'redux-rocketjump'
import { put } from 'redux-saga/effects'

const rj = rocketjump({
  successEffect: function (data, meta) {
    if (meta.successMessage) {
      yield put(showSuccessMessage(meta.successMessage))
    }
  }
})
```

Handle a delete call:
```js
import { rocketjump, takeEveryAndCancel, makeActionTypes } from 'redux-rocketjump'
import omit from 'lodash.omit'
import { createSelectors } from 'reselect' 

const rj = (config = {}, ...args) => rocketjump({
  takeEffect: takeEveryAndCancel,
  proxyActions: {
    load: ({ load }) => (id, params = {}, meta = {}) =>
      load({ ...params, id }, { ...meta, id }),
  },
  proxySelectors: ({ getBaseState }) => {
    const getDeleted = createSelector(getBaseState, ({ deleted }) => deleted)

    const getDeleting = createSelector(getBaseState, ({ deleting }) => deleting)

    const getFailures = createSelector(getBaseState, ({ failures }) => failures)

    return { getDeleted, getDeleting, getFailures }
  },
  proxyReducer: () => {
    const actionTypes = makeActionTypes(config.type)

    const defaultState = { deleting: {}, failures: {}, deleted: {} }

    return (prevState = defaultState, { type, payload, meta, error }) => {
      switch (type) {
        case actionTypes.loading:
          return {
            ...prevState,
            deleting: {
              ...prevState.deleting,
              [meta.id]: true,
            },
            failures: omit(prevState.failures, meta.id),
          }
        case actionTypes.failure:
          return {
            ...prevState,
            deleting: omit(prevState.deleting, meta.id),
            failures: {
              ...prevState.failures,
              [meta.id]: error,
            },
          }
        case actionTypes.success:
          return {
            ...prevState,
            deleting: omit(prevState.deleting, meta.id),
            deleted: {
              ...prevState.deleted,
              [meta.id]: true,
            },
          }
        case actionTypes.unload:
          return { ...prevState, ...defaultState }
        default:
          return prevState
      }
    }
  }
})(config, ...args)
```


## Compose rocketjumps
Come avrete notato rocketjump non è una funzione ma una funzione che genera una
una funzione questo perché è pensato per essere riutilizzato, infatti la funzione
che torna rj accetta una configurazione che viene composta nel seguente modo:

C1:
actions -> proxyActions(defaultActions)
selectors: proxySelectors(defaultSelectors)
reducer -> proxyReducer(makeBaseReudcer(dataReducer))
[].concat(successEffect)

C2:
actions -> proxyActions(c1Actions)
selectors: proxySelectors(c2selectors)
reducer: -> proxyReducer(c2reducer)
[successEffectC1].concat(successEffect)

Mentre le altre chiavi vengono sovrascritte con priorità agli ultimi...
type, api, callApi, takeEffect, takeEffectArgs

Quindi per fare un rj riutilizzabile basta non invocare l'ultima fn:
```js
const rjCool = rocketjump({
  proxyActions: {
    loadCool: ({ load }) => (params ={}, meta ={}) => load({ ...params, cool: true }, meta)
  }
})

// ...
export const { /*...*/ } = rjCool({
  type: 'GET_STUFF',
})

```

Se vuoi avere accesso alla configurazione per genrare il tuo rj:
```js
const rjCool = (config = {}, ...args) rocketjump({
  proxyActions: {
    loadCool: ({ load }) => (params ={}, meta ={}) => load({ ...params, cool: config.coolCode }, meta)
  }
})(config, ...large)
```

I rocketjump e le configurazioni si possono comporre all'infinito:
```js
rj(
  // config
  {}
  // rj
  rj({}),
  // fn that run an rj \w args
  (config, ...args) => rj({})(config, ...args),
)
```

## Handy helpers
...

## Working example
You can find a working example under src/example, it's a simple REST todo app that uses [json-server](https://github.com/typicode/json-server) as fake API server.

To run it first clone the repo:
