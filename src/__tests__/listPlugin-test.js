import { rj } from '../rocketjump'
import rjList, {
  makeListDataReducer,
  makeListSelectors,
  nextPreviousPaginationAdapter,
} from '../plugins/list'

describe('makeListDataReducer', () => {
  it('should make a list paginated reducer', () => {
    const reducer = makeListDataReducer(nextPreviousPaginationAdapter)
    const prevState = null
    const action = {
      type: 'GET_CA$_SUCCESS',
      payload: {
        params: {},
        data: {
          next: '/sghey?page=2',
          prev: null,
          count: 99,
          results: [
            {
              id: 23,
              name: 'Gio Va',
            },
            {
              id: 23,
              name: 'Ma IK',
            },
            {
              id: 7,
              name: 'Skinny Boy',
            }
          ]
        }
      }
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual(({
      pagination: {
        count: 99,
        current: { page: 1 },
        next: { page: 2 },
        previous: null,
      },
      list: [
        {
          id: 23,
          name: 'Gio Va',
        },
        {
          id: 23,
          name: 'Ma IK',
        },
        {
          id: 7,
          name: 'Skinny Boy',
        }
      ]
    }))
  })

  it('should append items when meta append', () => {
    const reducer = makeListDataReducer(nextPreviousPaginationAdapter)
    const prevState = {
      list: [
        {
          id: 99,
          name: 'Ninja'
        }
      ]
    }
    const action = {
      type: 'GET_CA$_SUCCESS',
      meta: { append: true },
      payload: {
        params: {},
        data: {
          next: '/sghey?page=2',
          prev: null,
          count: 99,
          results: [
            {
              id: 23,
              name: 'Gio Va',
            },
            {
              id: 23,
              name: 'Ma IK',
            },
            {
              id: 7,
              name: 'Skinny Boy',
            }
          ]
        }
      }
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual(({
      pagination: {
        count: 99,
        current: { page: 1 },
        next: { page: 2 },
        previous: null,
      },
      list: [
        {
          id: 99,
          name: 'Ninja'
        },
        {
          id: 23,
          name: 'Gio Va',
        },
        {
          id: 23,
          name: 'Ma IK',
        },
        {
          id: 7,
          name: 'Skinny Boy',
        },
      ]
    }))
  })

  it('should prepend items when meta prepend', () => {
    const reducer = makeListDataReducer(nextPreviousPaginationAdapter)
    const prevState = {
      list: [
        {
          id: 99,
          name: 'Ninja'
        }
      ]
    }
    const action = {
      type: 'GET_CA$_SUCCESS',
      meta: { prepend: true },
      payload: {
        params: {},
        data: {
          next: '/sghey?page=2',
          prev: null,
          count: 99,
          results: [
            {
              id: 23,
              name: 'Gio Va',
            },
            {
              id: 23,
              name: 'Ma IK',
            },
            {
              id: 7,
              name: 'Skinny Boy',
            }
          ]
        }
      }
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual(({
      pagination: {
        count: 99,
        current: { page: 1 },
        next: { page: 2 },
        previous: null,
      },
      list: [
        {
          id: 23,
          name: 'Gio Va',
        },
        {
          id: 23,
          name: 'Ma IK',
        },
        {
          id: 7,
          name: 'Skinny Boy',
        },
        {
          id: 99,
          name: 'Ninja'
        },
      ]
    }))
  })
})


describe('makeListSelectors', () => {
  it('should make selectors for list', () => {
    const {
      getList,
      getCount,
      getNumPages,
      hasNext,
      hasPrev,
      getNext,
      getPrev,
    } = makeListSelectors(a => a.data, 10)
    const state = {
      loading: false,
      error: null,
      data: {
        pagination: {
          count: 99,
          current: { page: 1 },
          next: { page: 2 },
          previous: null,
        },
        list: [
          {
            id: 23,
            name: 'Gio Va',
          },
          {
            id: 23,
            name: 'Ma IK',
          },
          {
            id: 7,
            name: 'Skinny Boy',
          }
        ]
      }
    }
    expect(getList(state)).toBe(state.data.list)
    expect(getCount(state)).toBe(99)
    expect(getNumPages(state)).toBe(10)
    expect(hasNext(state)).toBe(true)
    expect(hasPrev(state)).toBe(false)
    expect(getNext(state)).toBe(state.data.pagination.next)
    expect(getPrev(state)).toBe(null)
  })
})

describe('List plugin', () => {
  it('should have a list reducer', () => {
    const { reducer } = rj(rjList({
      pagination: nextPreviousPaginationAdapter,
      pageSize: 10,
    }), {
      type: 'S@CI@',
      state: 'users',
    })()

    const prevState = {
      loading: true,
      error: null,
      data: null,
    }
    const nextState = reducer(prevState, {
      type: 'S@CI@_SUCCESS',
      payload: {
        params: {},
        data: {
          next: '/sghey?page=2',
          prev: null,
          count: 99,
          results: [
            {
              id: 23,
              name: 'Gio Va',
            },
            {
              id: 23,
              name: 'Ma IK',
            },
            {
              id: 7,
              name: 'Skinny Boy',
            }
          ]
        }
      }
    })

    expect(nextState).toEqual(({
      loading: false,
      error: null,
      data: {
        pagination: {
          count: 99,
          current: { page: 1 },
          next: { page: 2 },
          previous: null,
        },
        list: [
          {
            id: 23,
            name: 'Gio Va',
          },
          {
            id: 23,
            name: 'Ma IK',
          },
          {
            id: 7,
            name: 'Skinny Boy',
          }
        ]
      }
    }))
  })

  it('should have a list selectors', () => {
    const { selectors } = rj(rjList({
      pagination: nextPreviousPaginationAdapter,
      pageSize: 10,
    }), {
      type: 'S@CI@',
      state: 'users',
    })()

    const {
      getList,
      getCount,
      getNumPages,
      hasNext,
      hasPrev,
      getNext,
      getPrev,
    } = selectors

    const state = {
      users: {
        loading: false,
        error: null,
        data: {
          pagination: {
            count: 99,
            current: { page: 1 },
            next: { page: 2 },
            previous: null,
          },
          list: [
            {
              id: 23,
              name: 'Gio Va',
            },
            {
              id: 23,
              name: 'Ma IK',
            },
            {
              id: 7,
              name: 'Skinny Boy',
            }
          ]
        }
      }
    }
    expect(getList(state)).toBe(state.users.data.list)
    expect(getCount(state)).toBe(99)
    expect(getNumPages(state)).toBe(10)
    expect(hasNext(state)).toBe(true)
    expect(hasPrev(state)).toBe(false)
    expect(getNext(state)).toBe(state.users.data.pagination.next)
    expect(getPrev(state)).toBe(null)
  })
})
