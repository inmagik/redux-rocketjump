---
id: plugin_map
title: Map Plugin
sidebar_label: Map Plugin
---
This plugin modifies the state shape into a dictionary shape. This is extremely useful when you have to work with omogeneous indexed data belonging to a collection. For example, any master-detail based API is a suitable candidate for the usage of this plugin

The map plugin works by changing the state shape, and adjusting selectors, actions and reducer accordingly.

The base state shape is
```js
{
    loading: false,
    data: { /* some data */ },
    error: null
}
```

This shape is replicated for each key to be stored, and the indexed replicas are used as the new state
```js
{
    key1: {
        loading: false,
        data: { /* some data */ },
        error: null
    },
    key2: {
        loading: false,
        data: { /* some data */ },
        error: null
    },
    /* and so on... */
}
```

In order to get this working, you need to configure a keyMakerFunction, that is, a function able to associate any dispatched action (among those regarding the mapped rocketjump) to a key in the store.

The default keyMakerFunction is the following
```js
action => action.meta ? action.meta.id : null
```

Additionally, you can provide your own custom [dataReducer](api/rocketpartial.md) to describe how you want the `data` key of any state part to be managed

The map plugin provides you ad-hoc actions and selectors to interact with the state shape described beforehand


**actions**
- loadKey: performs standard load action on an item, given its key. The given id is passed to the api `params` object and copied into the `meta` object. Hence, the signature of this function is `(id, params, meta) => void`
- unloadKey: performs standard unload action on an item, given its key

**selectors**
- getMapData: retrieves data key from any item, and returns them indexed by key
- getMapLoadings: retrieves loading state from any item, and returns them indexed by key
- getMapFailures: retrieves error key from any item, and returns them indexed by key

Basically, provided selectors slice the state vertically:
```js
// Suppose this is our state
state = {
    users: {
        23: {
            loading: false,
            data: data_23,
            error: null
        },
        39: {
            loading: false,
            data: data_39,
            error: null
        },
    }
}

let x = getMapData(state);
// x will contain the following structure
{
    23: data_23,
    39: data_39
}
```

## Example
```js
import rjMap from 'redux-rocketjump/plugins/map'

const { 
    actions: {
        loadKey: loadUserByKey,
        unloadKey: unloadUserByKey
    },
    reducer,
    selectors: {
        getMapLoadings: getUserLoadingState,
        getMapData: getUserData,
        getMapFailures: getUserError
    },
    saga
} = rj(
        rjMap({
            keepSucceeded: true             // Set to false to remove elements from the map
                                            // when the async task completes with success
                                            // for them
        }),
        {
            type: 'GET_USER',
            state: 'users',
            api: fetchUsers
        }
    )()
```