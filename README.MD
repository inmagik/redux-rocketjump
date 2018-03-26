# TODOS
- [ ] Finish writing README
- [ ] Improve tests
- [x] Improve organization of pre-maded rj detail, list and delete...

# redux-rocketjump
Rocketjump your redux! Speed up redux-app development

# Install

```
yarn add redux-rocketjump
```
or
```
npm install --save redux-rocketjump
```

# Install peer dependencies
redux-rocketjump use `redux-saga` to handle side effects, and `reselect` to make ad hoc memoized selectors.
```
yarn add redux-saga reselect
```
or
```
npm install --save redux-saga reselect
```

## What?

redux-rocketjump is a set of tools to speed up the devlopment of an a redux based app.
redux-rocketjump encourage composition and exentibilty instead of an "a black box that do all the stuff" approach .

## Why?

When develop a large redux app with a lot of entities is some cases this can lead to a lot of copy-paste code an a difficult to share behaviours, redux-rocketjump try to bridge this gap using composition and functional programming.

## Organize redux code by functionality
When starting writing a redux app is common to organize code by type Es:. (actions, reducers, selectors, ...).
But when the app get bigger this approach lead to confusion, unmantenibility and in a difficult scalability.
So instead yuo should organizing state folders by what they does Es:. (tods, users, tickets, ...).
To do this redux-rocketjump offers you two covenient methods `makeAppsReducers` and `makeAppsSaga`.
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
      load: loadTodos,
      // Stop side effect and clear the state
      unload: unloadTods,
    },
    selectors: {
      // Promise resolved value
      getData: getTodos,
      // Promise is running?
      isLoading: isLoading,
      // The promise rejection value
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
The base rocketjump can be extendend with following options:
- `proxyReducer`:

Heres an examples of more cool todos rj:
```js
export const {
  actions: {
    load: loadTodos,
    loadMore: loadMoreTodos,
    unload: unloadTods,
  },
  selectors: {
    ca
  }

} = rocketjump({
  failureEffect: function *(error) {
    yield put(displayErrorToast(error))
  }
})
```


Di base rocketjump è una funzione che genera azioni, selettori, reducer e saga partendo
da:
  - type: l'action type che scatena il side effect e dal quale verrano generate
  i tipi dispacciati type_LOADING, type_SUCCESS, type_FAILURE, type_UNLOAD
  - state: il selettore base da cui vengono creati i selector, per comodità
  puo essere una stringa valida per lodash.get
  - api: il side effect ovvero una funzione che torna una promise

Questo è l'esempio minimo:


```js
// todos.js
import { rocketjump } from 'redux-rocketjump'
export const {
    actions: {
        // Trigger side effect
        load: loadTodos,
        // Stop side effect and clear the state
        unload: unloadTods,
    },
    selectors: {
        //
        getData: getTodos,
        isLoading: isLoading,
        //
        getError: getTodsError,
    }
} = rocketjump({
    // the ma
    type: 'GET_TODOS',
    //
    state 'todos',
    api: () => loadTodosFromApi(),
})()
```

# rocketjump configurabile
Quelle sopra sono le opzioni base x creare rj but puoi personalizzarle
ProxyActions is a hook to proxy action creators, if object is given every keys is used to generate new action creator, every value is called with all the previous generated action creators and the returned value is expcted to be the new action creator. Previous action creators were merged. If function is given, rj used the result as an objcet of action creators to be merged with previous action creators.
ProxyResuc
- proxyActions

- dataReducer
- proxyReducer
- resetReducerOn()
- composeReducers()

- proxySelectors

- callApi
- successEffect
- failureEffect
- apiExtraParams
- takeEffect
- takeEffectArgs

```js
// todos.js
import { rocketjump } from 'redux-rocketjump'
export const {
    actions: {
        // Trigger side effect
        load: loadTodos,
        // Stop side effect and clear the state
        unload: unloadTods,
    },
    selectors: {
        //
        getData: getTodos,
        isLoading: isLoading,
        //
        getError: getTodsError,
    }
} = rocketjump({
    // the ma
    type: 'GET_TODOS',
    //
    proxyActions:,
    state 'todos',
    api: () => loadTodosFromApi(),
})()
```

# Rocketjump componibile
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

# Rocketjump battery included
As an examples and 4 real life there are some pre maded rjs
list, detail, delete
