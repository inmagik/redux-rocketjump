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
