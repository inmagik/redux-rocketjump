---
id: plugin_combine
title: Combine Plugin
sidebar_label: Combine Plugin
---
The combine plugin is used to merge several rocketjumps in a dictionary-like fashion: this plugin accepts a dictionary containing [RocketJump Partials](api/rocketpartial.md) and returns a complete RocketJump instance (already evaluated) that manages a state with the same structure of the original dictionary, but containing actual data in place of RocketJump Partials.

RocketJump partials to be combined **must** meet the following criteria
- each partial must have a configuration object at the last level of composition, which is called `combineConfig`
- the `combineConfig` object can contain any attribute that is valid in the context of a `RocketJump Partial`
- the `combineConfig` object **must** contain two special attributes
  - **combineType**: will be used like the `type` attribute when completing the build of the partial
  - **combineApi**: will be used like the `api` attribute when completing the build of the partial

Combine plugin invocation takes two parameters
```js
combineRjs(dict, config);
```

`dict` is the aformentioned dictionary of composable partial rocketJumps, while `config` is a simple object containing only one key: `state`. This key can contain either a string or a selector, and plays the same role as the `state` parameter of a [final RocketJump configuration](api/rocketjump.md)

Example
```js

// This is a list plugin instance
const rjBaseList = rjList({
    pagination: nextPreviousPaginationAdapter,
    pageSize: 20,
})

const { reducer } = combineRjs({
    list: rj(rjBaseList, {
        combineType: GET_BROS,
        composeReducer: [
            makeUpdateReducer(
                SET_BRO_STARRED,
                'data.list',
                undefined,
                ({ payload: { data: { starred } } }, obj) => ({ ...obj, starred }),
            ),
            makeRemoveListReducer(DELETE_BRO),
            makeUpdateReducer(UPDATE_BRO, 'data.list'),
        ],
        combineApi: () => BROS,
    }),

    starring: rj(rjUpdate(), {
        proxyActions: {
            load: ({ load }) => (id, starred) =>
                load({ id, starred }, { id }),
        },
        combineType: SET_BRO_STARRED,
        // Return new "starred" state
        combineApi: ({ id, starred }) => ({ id, starred }),
    }),

    deleting: rj(rjDelete(), {
        combineType: DELETE_BRO,
        // Such as 204 No Content
        combineApi: () => null,
    }),

    updating: rj(rjUpdate(), {
        combineType: UPDATE_BRO,
        // Such as 204 No Content
        combineApi: () => null,
    })
}, { state: 'bros' })
```