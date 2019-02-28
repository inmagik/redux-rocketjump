## 1.7.2
###### *February 11, 2019*
- Fixed a bug with `unloadBy` and `state` options setted to `false`

## 1.7.1
###### *October 12, 2018*
- Added `makeAddListReducer` to `hor` plugin

## 1.7.0
###### *October 3, 2018*
- Added `unloadBy` to `rj` API a list of actions to unload the side effect and reset the reducer

## 1.6.0
###### *September 6, 2018*
- Rename `catalogs` to `plugins`
- Added `cache` plugin
- Added `needEffect` to `rj` API a saga effect to determinate if run api.

## 1.5.0
###### *August 24, 2018*
- The `takeLatestAndCancelGroupBy` effect clear all pending tasks when match cancel pattern \w null key
- Added new core option `composeReducer` to `rj` that expect an array of reducers to compose to current reducer.
- Added map catalog to handle map like data.
- Added update catalog to handle multi update entities.
- Added delete catalog to handle deleting entities.

## 1.4.1
###### *August 24, 2018*
- Workaround in promise catalog to avoid bug \w React Native

## 1.4.0
###### *August 23, 2018*
- Added list catalog to make a paginated list `rj`
- Added hor catalog with some HORs (higher-order reducer)

## 1.3.0
###### *April 11, 2018*
- You can now pass `false` to `rj` `state` param to omit reducer creation, util when you need only to
run action driven side effect in rocketjump environment.
- Added a `config` property to `rj` with the configuration of rocketjump.

## 1.2.0
###### *April 11, 2018*
- Api function can be invoked through positional arguments instead of an object.
- Added *positionalArgs* rj catalog to call the `load` actionCreator with positional arguments params.

## 1.1.0
###### *April 10, 2018*
- Added the first *catalog*! The *promise* catalog that transform the `load` action creator in to a promise using
 the awesome [redux-saga-thunk](https://github.com/diegohaz/redux-saga-thunk).
- Pubblished flat directories to npm.
- Changed the base reducer set the error state using `payload` key instead of the `error` key.
- Dispatched `{ type, payload: error, error: true }` intstead of `{ type, error }` on failure.
- Added the `mapLoadingAction` rj config option to map the action dispatched on loading.
- Added the `mapFailureAction` rj config option to map the action dispatched on failure.
- Added the `mapSuccessAction` rj config option to map the action dispatched on success.
