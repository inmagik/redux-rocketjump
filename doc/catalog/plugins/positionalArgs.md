This plugins allows the load function to use positional arguments instead of objects. It operates by converting the signature of the `load` function

```code
lang: js
---
// standard signature
load: (params, meta) => void

// new signature
load: (...args) => void
```

The plugin maps positional arguments either to params and to meta, but in different ways.

The params mapping is easy, since `params` is assigned the array `[...args]`

The meta mapping is instead more flexible, and allows to select which arguments from the list import in the meta object and under which key. This is done by specifing parameters in the plugin configuration object: each parameter can be either a string or a falsy value, where a string means that the argument passed to the load function in the same position must be imported in meta using that string as key, and a falsy value means not to import the argument in the same position. Refer to the example for more details

## Example
```code
lang: js
---
import rjPosArgs from 'redux-rocketjump/plugins/positionalArgs'

const {
    actions: { load: variadicLoad }
} = rj(
        rjPosArgs(
            'id', null, false, 'tek', 'isCool'
        ),
        {
            type: 'EXAMPLE',
            state: 'example',
            api: exampleApiDefinition,
        }
    )()

// Then, invoke action like
variadicLoad(777, 'rocket', 'jump', 23);

/*
    The standard load action corresponding to this is
    load([777, 'rocket', 'jump', 23], { id: 777, tek: 23 })

    The meta object is constructed by mapping keys and values positionally
    PluginDefinition    CallValue       Result (keys and values of meta object)
    'id'                777             id: 777
    null                'rocket'        -
    false               'jump'          -
    'tek',              23              tek: 23
    'isCool'            undefined       -
*/
```