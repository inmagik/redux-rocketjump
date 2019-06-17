---
id: plugin_list
title: List Plugin
sidebar_label: List Plugin
---
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

```js
import { rj } from 'redux-rocketjump'
import rjList, { nextPreviousPaginationAdapter } from 'redux-rocketjump/plugins/list' 

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
        rjList({
            pageSize: 50,
            pagination: nextPreviousPaginationAdapter
        }),
        {
            state: 'items',
            type: GET_ITEMS,
            api: ({page}) => fetch(`http://example.com/items?page=${page}`)
                .then(response => response.json())
        }
    )()

```


### Creating a pagination adapter
A pagination adapter is just a plain JavaScript object with a fixed interface. Any field can be a string or a selector. If it is a string, is will be used through `lodash.get()`

```js
{
  
  // When a request to the paginated API is made, this selector is used to extract actual data from response
  list: 'results',
  
  // When a request to the paginated API is made, this selector is used to extract the number of data elements contained in the response
  count: 'count',

  // When a request to the paginated API is made, this selector is used to determine the number of the loaded page 
  current: pickPage,

  // When a request to the paginated API is made, this selector is used to extract the params to pass to the request to load the next page
  // If there is no next page, this should return null
  next: ({ next }) => pickParamsFromUrl(next, pickPage),

  // When a request to the paginated API is made, this selector is used to extract the params to pass to the request to load the previous page
  // If there is no previous page, this should return null
  previous: ({ previous }) => pickParamsFromUrl(previous, pickPage),
}
```
