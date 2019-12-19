---
id: plugin_cache
title: Cache Plugin
sidebar_label: Cache Plugin
---
This plugin injects a caching dynamic in a RocketJump.

The cache works in the following way
- when you instantiate a RocketJump, the cache is empty
- when you first call the `load` function, result is extracted and copied in the cache
- subsequent calls do not run the asynchronous effect, but directly resolve on the cached value
- you can force the cache to refresh by leveraging an ad-hoc action: `loadForce`

## Use cases
You can use this plugin whenever your data are not expected to change or changes are very unfrequent with respect to the number of calls to the `load` action. The usage of a cache in this context greatly helps with performance by removing delays due to asynchronous jobs

## Example
```js
import rjCache from 'redux-rocketjump/plugins/cache'
// other code here...
const {
    actions: {
        load,
        loadForce,
    },
    reducer,
    selectors: {
        isLoading: isMyDataLoading,
        getData: getMyData,
        getError: getMyDataError
    },
    saga,
} = rj(
        rjCache,
        {
            type: 'MY_DATA',
            state: 'myData',
            effect: fetchMyDataApi,
        }
    )()
```

