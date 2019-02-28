Hor Plugin contains some useful functions that create reducers. This is provided in order to easily create reducers for common tasks, like adding elements to a list, removing elements from a list or updating complex structures.

## Update reducer
Helper name: `makeUpdateReducer`

This helper generates a reducer that is suitable to manage update actions. It can be applied to states that have either a scalar or an array structure, like in the following examples

```code
lang: js
span: 3
---
// Scalar structured state
{
    loading: false,
    error: null,
    data: {
        id: 23,
        name: '@theReal',
        work: 'Pick Up Girlz',
    }
}
```

```code
lang: js
span: 3
---
// Vector structured state
{
    loading: false,
    error: null,
    data: [
        {
            id: 23,
            name: '@theReal',
            work: 'Pick Up Girlz',
        }, {
            id: 23,
            name: '@theReal',
            work: 'Pick Up Girlz',
        }
    ]
}
```

Moreover, the update can be set to happen at any depth

```code
lang: js
---
{
    loading: false,
    log: ['~'],
    data: {
        id: 23,
        name: 'Gio Va',
        friends: {
            other: {},
            best: {
                withMoney: {
                    // Update might be specified to happen here
                    id: 10,
                    name: 'MR M$X',
                }
            }
        }
    }
}
```

The reducer creation takes several parameters
```code
lang: js
---
makeUpdateReducer(type, path, identity, updater)
```

#### type
Type: string | string[]

This attribute specifies the base type for actions managed by this reducer. It is similar to the `type` attribute of a RocketJump configuration. In case it is an array, the reducer will respond to actions derived from all the types contained in the array


#### path
Type: string
Default value: `'data'`

This attribute specifies the path to write data at


#### identity
Type: function
Default value: `(action, object) => action.meta.id === object.id`

This function is used to determine if an action targets a specific object or not, that is, whether the update carried out by `action` is to be applied to the `object`

#### updater
Type: function
Default value: `(action, object) => action.payload.data`

This function is used to apply the update carried out by `action` to the object `object`. By default, content is overridden by the action payload.

## ListRemove reducer
Helper name: `makeRemoveListReducer`

This helper generates a reducer that is suitable to manage deletion of elements contained in a list. It is usually used to handle deletion of data organized in a [list](/plugins/list) structure

Syntax

```code
lang: js
---
makeRemoveListReducer(type, listPath, paginationPath, identity)
```

#### type
Type: string | string[]

This attribute specifies the base type for actions managed by this reducer. It is similar to the `type` attribute of a RocketJump configuration. In case it is an array, the reducer will respond to actions derived from all the types contained in the array

#### listPath
Type: string
Default value: `'data.list'`

This attribute specifies the path where the list stores its elements

#### paginationPath
Type: string
Default value: `'data.list'`

This attribute specifies the path where the list stores information about pagination

#### identity
Type: function
Default value: `(action, object) => action.meta.id === object.id`

This function is used to determine if an action targets a specific object or not, that is, whether the update carried out by `action` is to be applied to the `object`

## ListAdd reducer
Helper name: `makeAddListReducer`

This helper generates a reducer that is suitable to manage insertion of elements in a list. It is usually used to handle insertion of data a [list](/plugins/list) based structure

Syntax

```code
lang: js
---
makeAddListReducer(type, listPath, paginationPath, addToList)
```

#### type
Type: string | string[]

This attribute specifies the base type for actions managed by this reducer. It is similar to the `type` attribute of a RocketJump configuration. In case it is an array, the reducer will respond to actions derived from all the types contained in the array

#### listPath
Type: string
Default value: `'data.list'`

This attribute specifies the path where the list stores its elements

#### paginationPath
Type: string
Default value: `'data.list'`

This attribute specifies the path where the list stores information about pagination

#### addToList
Type: function
Default value: `(list, action) => list.concat(action.payload.data)`

This function is used to actually insert the element in the array that implements the list, and can be used to set a customary insertion logic (append, prepend, in order insert, ...)