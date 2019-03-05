This plugin is based on the map plugin, and adds over it logic to manage updating of entities. By applying the update plugin, you get your state organized like with the map plugin, plus some actions to deal with updating APIs. It is possibile to remove entities once updated by setting a configuration flag on the plugin.

This plugin wraps the standard `load` action in order to extract the key of the entity being updated and correlate the api action with the update in the local state. The `api` function is supposed to return the full updated entity.

Differently from [Map Plugin](/plugins/map), it is not possible to customize the key derivation logic in this plugin: the primary key must be contained in the `id` property of the objects inserted in the map.

## Example
```code
lang: js
---
import rjUpdate from 'redux-rocketjump/plugins/update';

const { 
    actions: { 
        performUpdate: updateHuman 
    },
    reducer,
    selectors: {
        getUpdating: getHumansDeleting,
        getFailures: getHumanDeletionErrors,
    },
    saga
} = rj(
        rjUpdate({
            keepUpdated: true               // Set to false to remove updated entities from state
        }),
        {
            type: 'UPDATE_HUMAN',
            state: 'humans',
            api: putHuman
        }
    )()
```
