The entry point for RocketJump is called `rj`.

The `rj` function takes any number of parameters, each of which is a configuration object or another `RocketJump Partial`, and returns a `RocketJump Partial`. This allows for recursive composition (see [composition](/api/composition)). To stop composing and get a real rocketjump, you have to invoke the last `RocketJump Partial`.

```code
lang: js
---
import { rj } from 'redux-rocketjump';
rj({ /* put yout configuration here */ })
```

# Configuration options
## proxyAction *(object|function)*
This property can be used to customize the generated actions by adding more ones.

This property can be used in two ways
- if it contains an object, then a new action dispatcher is generated for each of the keys. Each value **must** be a function that takes one argument, that is an object containing the default `load` and `unload` action dispatchers, and returns an action dispatcher. 
- it it contains a function, that function is invoked with an object containing the default `load` and `unload` action dispatchers as argument, and **must** return an object containing, for each key, an action dispatching function

Examples: implement complex behaviours

```code
lang: js
---
{
    // ... other config options ...
    proxyActions: {
        loadMore: ({ load }) => (params = {}, meta = {}) => load(params, { ...meta, more: true })
    }
}
```

```code
lang: js
---
{
    // ... other config options ...
    proxyActions: ({ load }) => {
        return {
            loadMore: (params = {}, meta = {}) => load(params, { ...meta, more: true })
        }
    }
}
```

## proxySelectors *(object|function)*
This property can be used to customize the generated selectors by adding more ones.

This property can be used in two ways
- if it contains an object, then a new selector is generated for each of the keys. Each value **must** be a function that takes one argument, that is an object containing the default `isLoading`,`getData` and `getError` selectors, and returns a selector. 
- it it contains a function, that function is invoked with an object containing the default `isLoading`,`getData` and `getError` selectors as argument, and **must** return an object containing, for each key, a selector

Examples: add a custom property

```code
lang: js
---
{
    // ... other config options ...
    proxySelectors: {
        getData: ({ getData }) => createSelector(getData, todos =>
            todos === null ? null : todos.map(todo => ({
                ...todo,
                asReadMe: `* [${todo.done ? 'v' : ''}] ${todo.title}`
            }))
        )
    }
}
```

```code
lang: js
---
{
    // ... other config options ...
    proxySelectors: ({ getData }) => ({
        getData: createSelector(getData, todos =>
            todos === null ? null : todos.map(todo => ({
                ...todo,
                asReadMe: `* [${todo.done ? 'v' : ''}] ${todo.title}`
            }))
        )
    })
}
```

## proxyReducer *(function)*
This property can be used to customize the generated reducer.

If given, this property is expected to contain a function that is called with the automatically generated reducer and that **must** return the reducer to be used in place of the default one

Example: translate error messages
```code
lang: js
---
{
    // ... other config options ...
    proxyReducer: oldReducer => (state, action) => {
        switch(action.type) {
            case 'MY_COOL_ACTION_ERROR':
                return {
                    ...state,
                    errors: translateAll(action.errors)
                }
            default:
                return oldReducer(state, action);
        }
    }
}
```

## dataReducer *(function)*
If this property is set, it **must** contain a sub reducer to handle the `${type}_SUCCESS` action on the piece of state related to data. The default implementation is: 

```code
lang: js
---
(prevState, { type, payload }) => payload.data
```

Example: deserialize date objects
```
lang: js
---
{
    // ... other config options ...
    dataReducer: (oldData, { type, payload }) => {
        return payload.map(item => ({
            ...item,
            date: new Date(item.date)
        }))
    }
}
```

## callApi *(effect)*
If this property is given then its value is used instead of the `call` function from redux-saga to call the api function. As such, this property **must** contain a generator. 

Example: manage authentication tokens
```code
lang: js
---
{
    // ... other config options ...
    callApi: function *(apiFn, ...args) {
        const token = yield select(state => state.auth.accessToken)
        const result = yield call(apiFn, ...args, token)
        return result
    }
}
```

## apiExtraParams *(generator|generator[])*
If this property is given, it is expected to be a generator or an array of generators. These are used sequentially to compute additional parameters to be passed to the `api` function in the `params` argument.
The first generator is invoked with the `params` and `meta` objects as its arguments, and its output is merged into the `params` object itself. Each of following generators is invoked with the `params` object obtained after the last run and the `meta` object, and the output is merged again in the same way of the first run. In order to achieve this, each generator **must** return an object. The `params` object obtained after the last generator has been invoked and its result has been blended is used to run the asynchronous task. 

Example: manage pagination data
```code
lang: js
---
{
    // ... other config options ...
    apiExtraParams: function *(params, meta) {
        if (meta.loadMore) {
            const next = yield select(state.pagination.next)
            return { next }
        }
    }
}
```

## needEffect *(generator)*
If this property is provided, it is expected to be a generator, which is invoked right before the `api` task begins to run: if the generator yields a falsy value, the `api` run is skipped.

Example: skip some calls to an API because we are caching the value
```code
lang: js
---
rj({
    // ... other config options ...
    proxyActions: {
        load: ({ load }) => 
                (params = {}, meta = {}) =>
                  load(params, { ...meta, cache: true }),
    },
    needEffect: function *(meta) {
        if (!meta.cache) {
            return true
        }
        const { getData } = makeSelectors(config.state)
        const data = yield select(getData)
        return data === null
    }
})
```

## successEffect *(generator|generator[])*
If this property is provided, it is expected to be a generator or an array of generators. These generators are invoked when the Promise returned by the `api` function resolves, and each of them is called with the data obtained from the promise resolution along with the `meta` object passed in the action dispatcher.

Example: do something with the result
```code
lang: js
---
{
    // ... other config options ...
    successEffect: function *(data, meta) {
        if (meta.successMessage) {
            yield put(showSuccessMessage(meta.successMessage))
        }
    }
}
```

## failureEffect *(generator|generator[])*
If this property is provided, it is expected to be a generator or an array of generators. These generators are invoked when the Promise returned by the `api` function rejects, and each of them is called with the data obtained from the promise rejection along with the `meta` object passed in the action dispatcher.

Example: alert errors
```code
lang: js
---
{
    // ... other config options ...
    failureEffect: function *(error) {
        yield put(showErrorToast(`Sorry our monkeys are trying to do their best, ${error.message}`))
    }
}
```

## takeEffect *(effect)*
The effect that describes how the tasks spawned by the main action type are handled. The default value is `takeLatestAndCancel`: it spawns a task every time the `load` function is called, and cancels any previous pending tasks. This is usually the wanted behaviour in case of GET requests. If you need a different behavior can choose one from `redux-rocketjump/effects`, or you can implement a custom one.

## takeEffectArgs *(any[])*
If provided, it **must** be an array of additional params to be passed to `takeEffect`. The elements contained in the array are arbitrary. When `takeEffect` is used, these params are spread as arguments.

## mapLoadingAction *(function)*
If provided, it **must** be a function that is applied to the action dispatched by a `load` call and that should be used to transform the action before it is dispatched. It **must** return the modified action.

## mapSuccessAction *(function)*
If provided, it **must** be a function that is applied to the action dispatched when `api` completes before it is dispatched. It **must** return the modified action.

## mapFailureAction *(function)*
If provided, it **must** be a function that is applied to the action dispatched when `api` fails before it is dispatched. It **must** return the modified action.

## composeReducer *(function[])*
It is possibile to pass a list of reducer functions to be composed together, along with the default reducer. Composition here means that any action dispatched to the reducer built by rocketjump will be dispatched through the default reducer, and then through all this list of reducers. This allows the combination of reducers handling different action types

Example: combining more HOR plugins
```code
lang: js
---
{
    // ... other config options ...
    composeReducer: [
        makeUpdateReducer(
            SET_USER_STARRED,
            'data.list',
            undefined,
            ({ payload: { data: { starred } } }, obj) => ({ ...obj, starred }),
        ),
        makeRemoveListReducer(DELETE_USER),
        makeUpdateReducer(UPDATE_USER, 'data.list'),
    ]
}
```