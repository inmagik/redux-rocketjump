Redux-RocketJump ships with a set of plugins that can be used as out of the box solutions for common tasks. The creation and usage of plugins is heavily based on the [composition features](/api/composition) embedded in Redux-RocketJump.

Plugins are usually implemented as [RocketJump Partials](/api/rocketpartial) that you use by composing them like you do with regular RocketJumps. This makes extremely easy to create new plugins: indeed, every RocketJump Partial is a plugin.

Some plugins, like the `Combine Plugin` are instead implemented to work on evaluated `RocketJump`s. 

We recommend you to read the documentation of the plugin(s) you are interested in to know more about the services it can offer and how to use it.

The following plugins are available out of the box:

```table
rows:
- Name: Cache Plugin
  Feature: "Provides caching of results from asynchronous calls: the task is invoked just one time, the following times the result is served from cache"
- Name: Combine Plugin
  Feature: "Combines several `RocketJump`s in an object-like fashion, much like *Redux*'s *combineReducers*"
- Name: Delete Plugin
  Feature: "Provides common logic to sync state with deleting apis, for both hard and soft deletes. It is based on the map plugin"
- Name: Hor Plugin
  Feature: "Provides some handy functions to craft reducers for common tasks"
- Name: List Plugin
  Feature: "Provides common logic to deal with paginated lists"
- Name: Map Plugin
  Feature: "Provides key-based state management: data returned by asynchronous task are indexed by key and managed in the same piece of state"
- Name: PositionalArgs Plugin
  Feature: "Provides positional arguments for load function instead of object based arguments"
- Name: Promise Plugin
  Feature: "This plugin adds `Promise`s to action dispatchers"
- Name: Update Plugin
  Feature: "Provides common logic to sync state with updating apis. It is based on the map plugin"
```