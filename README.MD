# TODOS
- [ ] Finish writing README 
- [ ] Improve tests
- [ ] Improve organization of pre-maded rj detail, list and delete... 

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

redux-rocketjump is a set of tool to speed up the devlopment of an a redux based app.
redux-rocketjump encourage composition and exentibilty instead of an "a black box that do all the stuff" approach .

## Why?

When develop a large redux app with a lot of entities is some cases this can lead to a lot of copy-paste code an a difficult to share behaviours, redux-rocketjump try to bridge this gap using composition and functional programming.

# Organize state folders
The one main idea is to organize the state folder by functionality instead of type es (actions, reducers, selectors, ...).
Every folders should export a `reducer` key used to inject into main reducer and, if needed a `saga` key used to handle side effects.
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

# Your first rocketjump!

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
})
...
```
