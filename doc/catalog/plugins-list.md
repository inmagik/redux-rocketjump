## Use cases

When interacting with a paginated REST API:

- the API returns only a page of the collection at the time, with metadata specifying the position of the page and the total number of pages or objects in the collection.
- some parameters are passed to API requests to identify the page we want to load

This plugins adds pagination state management and related selectors to get:
- current, next and previous pages references
- total items count

Since pagination parametrization and metadata can be implemented with different strategies (page number pagination, limit-offset pagination, token-based pagination, etc.),
this plugin offers the possibility to use different adapters.
Some common adapters are provided, specifically implemented for django-rest-framework pagination classes, but that may be used as a reference for other pagination adapters

## Usage

```code
lang: js
---
import { rj } from 'redux-rocketjump'
import rjList, { nextPreviousPaginationAdapter } from 'redux-rocketjump/plugins/list' // <- importing the plugin

const GET_ITEMS = 'GET_ITEMS'

const {
  selectors: {
    getList: getItems,
    getCount: getItemsCount,
    getNumPages: getItemsNumPages,
    getPrev: getItemsPrev,
    getNext: getItemsNext,
    hasPrev: hasItemsPrev,
    hasNext: hasItemsNext,
  },
  actions: {
    load: loadItems,
    unload: unloadItems,
  }
} = rj(

  // adding plugin to rocketjump
  rjList({
    pageSize: 50,
    pagination: nextPreviousPaginationAdapter
  }),

  // rocketjump configuration
  {
    state: 'items',
    type: GET_ITEMS,
    api: ({page}) => fetch(`http://example.com/items?page=${page}`)
      .then(response => response.json())
  }
)()

```


## Creating a pagination adapter

## Explicit pagination

## Infinite scroll
