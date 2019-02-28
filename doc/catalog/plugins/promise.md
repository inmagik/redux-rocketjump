This plugin adds `Promise`s to action dispatchers using the awesome library `redux-saga-thunk`.

```code
lang: js
---
import rjWithPromise from 'redux-rocketjump/plugins/promise'

const {
    actions: {
        load,
        unload,
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