This plugin is based on the map plugin, and adds over it logic to manage soft and hard deletion of entities. By applying the delete plugin, you get your state organized like with the map plugin, plus some actions to update it in case of a soft or a hard delete. The selection between the two possibilities is done using a configuration flag to be passed to the plugin constructor.

The provided action dispatcher takes the same parameters as the `loadKey` function provided by the [Map plugin](/plugins/map)

## Example
```code
lang: js
---
import rjDelete from 'redux-rocketjump/plugins/delete';

const { 
    actions: { 
        performDelete: deleteHuman 
    },
    reducer,
    selectors: {
        getDeleting: getHumansDeleting,
        getDeleted: getHumansDeleted,               // Soft-deletes only
        getFailures: getHumanDeletionErrors
    },
    saga
} = rj(
        rjDelete({
            keepDeleted: false                      // Set to true to perform a soft delete
        })
    )({
        type: 'DELETE_HUMAN',
        state: 'humans',
    })
```
