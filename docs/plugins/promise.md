---
id: plugin_promise
title: Promise Plugin
sidebar_label: Promise Plugin
---
This plugin adds `Promise`s to action dispatchers using the awesome library `redux-saga-thunk`.

```js
import rjWithPromise from 'redux-rocketjump/plugins/promise'

const {
    actions: {
        load,
        unload,
    },
    saga,
} = rj(
      rjWithPromise,
      {
          type: 'GET_TODOS',
          state: 'todos',
          effect: loadTodosFromApi,
      }
    )()

// ... next ...
store.dispatch(load())
  .then(() => /* ... */)
  .catch(() => /* ... */)
```

> In order to work, this plugin requires you to install `redux-saga-thunk`