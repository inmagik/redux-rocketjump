---
id: plugins-intro
title: Plugins
sidebar_label: Introduction
---
Redux-RocketJump ships with a set of plugins that can be used as out of the box solutions for common tasks. The creation and usage of plugins is heavily based on the [composition features](api/composition.md) embedded in Redux-RocketJump.

Plugins are usually implemented as [RocketJump Partials](api/rocketpartial.md) that you use by composing them like you do with regular RocketJumps. This makes extremely easy to create new plugins: indeed, every RocketJump Partial is a plugin.

Some plugins, like the `Combine Plugin` are instead implemented to work on evaluated `RocketJump`s. 

We recommend you to read the documentation of the plugin(s) you are interested in to know more about the services it can offer and how to use it.

The following plugins are available out of the box:

| Plugin | Features |
| ------ | -------- |
| Cache Plugin | Provides caching of results from asynchronous calls: the task is invoked just one time, the following times the result is served from cache |
| Combine Plugin | Combines several `RocketJump`s in an object-like fashion, much like *Redux*'s *combineReducers* |
| Delete Plugin | Provides common logic to sync state with deleting apis, for both hard and soft deletes. It is based on the map plugin |
| Hor Plugin | Provides some handy functions to craft reducers for common tasks |
| List Plugin | Provides common logic to deal with paginated lists |
| Map Plugin | Provides key-based state management: data returned by asynchronous task are indexed by key and managed in the same piece of state |
| PositionalArgs Plugin | Provides positional arguments for load function instead of object based arguments |
| Promise Plugin | This plugin adds `Promise`s to action dispatchers |
| Update Plugin | Provides common logic to sync state with updating apis. It is based on the map plugin |