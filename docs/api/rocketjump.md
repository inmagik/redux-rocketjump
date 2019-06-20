---
id: rocketjump
title: RocketJump
sidebar_label: RocketJump
---
## What is a RocketJump?
When you have composed all the logic you need, it is time to export generated actions, reducer, saga and selectors, and so make the real rocketjump!

In order to do this, you have to invoke the last `RocketJump Partial`.

```js
const output = myRocketJumpPartial()
```

In order to be invokable, a `RocketJump Partial` **must** contain three additional properties. These properties **must** be defined in the last configuration object supplied to the definition of the `RocketJump Partial` you are invoking.

Example
```js
const myRocketJumpPartial = rj(
    rjPlugin1,
    rjPlugin2,
    {
        /* other optional properties */

        /* ----- THIS IS THE IMPORTANT PART ----- */
        type: 'COOL_API_TYPE',
        api: myAsyncFunction,
        state: 'soCool'
    }
)
```

## Configuration settings
### type *(string)*
This key configures the name of the asynchronous task you are going to generate. It is **mandatory** that this name is unique throughout your application, in order to avoid name clashes. The value of this key is used as a prefix to create action types that will be used in the saga to tame asynchronism:
- `${type}_LOADING` is dispatched when the asynchronous operation starts
- `${type}_SUCCESS` is dispatched when the asynchronous operation completes successfully
- `${type}_FAILURE` is dispatched when the asynchronous operation completes with some error
- `${type}_UNLOAD` is dispatched when the asynchronous operation is stopped and the state cleared

### state *(string|selector|function|false)*
This key configures the base selector used to access data managed by this rocketJump instance.
It can be a string, a selector from [reselect](https://github.com/reduxjs/reselect) or a function.

If it is a string, it is used like a path to access the state object using [lodash.get](https://lodash.com/docs/#get).
If it is a selector, it will be used as a base selector to create nested selectors.
If it is a function, it will be called with the redux store as its first argument.

If it is `false`, both selectors and reducer creation is skipped. This is useful when you need only to run action driven side effect in rocketjump environment.

### api *(function)*
This is the side effect, the asynchronous task incapsulated in this rocketjump instance. The function passed to this key must conform the following signature

```js
(params: any) => Promise
```

The params argument will contain the first argument passed to the generated `load` action.

It is important that this function returns a Promise that resolves on valid data and rejects in case any error occurs. This allows the saga to launch the task and observe the outcome, reacting properly to eventual errors.