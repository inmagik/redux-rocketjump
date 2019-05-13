import { rj } from "../../.."
import rjList from ".."
import { nextPreviousPaginationAdapter } from "../pagination"
import { SUCCESS } from "../../../actionTypes";

describe('List Plugin', () => {
  it('should make a list paginated reducer', () => {

    const { reducer } = rj(
      rjList({
        pageSize: 100,
        pagination: nextPreviousPaginationAdapter
      }),
      {
        effect: () => Promise.resolve(1)
      }
    )()

    const prevState = {
      data: null,
      pending: false,
      error: null
    }

    const action = {
      type: SUCCESS,
      payload: {
        params: {},
        data: {
          next: '/my-api?page=2',
          prev: null,
          count: 99,
          results: [
            {
              id: 23,
              name: 'Alice',
            },
            {
              id: 23,
              name: 'Bob',
            },
            {
              id: 7,
              name: 'Eve',
            },
          ],
        },
      },
    }

    const nextState = reducer(prevState, action)

    expect(nextState).toEqual({
      pending: false,
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
            name: 'Alice',
          },
          {
            id: 23,
            name: 'Bob',
          },
          {
            id: 7,
            name: 'Eve',
          },
        ]
      }
    })
  })

  it('should append items when meta append', () => {

    const { reducer } = rj(
      rjList({
        pageSize: 100,
        pagination: nextPreviousPaginationAdapter
      }),
      {
        effect: () => Promise.resolve(1)
      }
    )()

    const prevState = {
      data: {
        list: [
          {
            id: 99,
            name: 'Mallory',
          },
        ],
      },
      pending: false,
      error: null
    }

    const action = {
      type: SUCCESS,
      meta: { append: true },
      payload: {
        params: {},
        data: {
          next: '/my-api?page=2',
          prev: null,
          count: 99,
          results: [
            {
              id: 23,
              name: 'Alice',
            },
            {
              id: 23,
              name: 'Bob',
            },
            {
              id: 7,
              name: 'Eve',
            },
          ],
        },
      },
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual({
      pending: false,
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
            id: 99,
            name: 'Mallory',
          },
          {
            id: 23,
            name: 'Alice',
          },
          {
            id: 23,
            name: 'Bob',
          },
          {
            id: 7,
            name: 'Eve',
          },
        ],
      }
    })
  })

  it('should prepend items when meta prepend', () => {

    const { reducer } = rj(
      rjList({
        pageSize: 100,
        pagination: nextPreviousPaginationAdapter
      }),
      {
        effect: () => Promise.resolve(1)
      }
    )()

    const prevState = {
      data: {
        list: [
          {
            id: 99,
            name: 'Mallory',
          },
        ],
      },
      pending: false,
      error: null
    }

    const action = {
      type: SUCCESS,
      meta: { prepend: true },
      payload: {
        params: {},
        data: {
          next: '/my-api?page=2',
          prev: null,
          count: 99,
          results: [
            {
              id: 23,
              name: 'Alice',
            },
            {
              id: 23,
              name: 'Bob',
            },
            {
              id: 7,
              name: 'Eve',
            },
          ],
        },
      },
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual({
      pending: false,
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
            name: 'Alice',
          },
          {
            id: 23,
            name: 'Bob',
          },
          {
            id: 7,
            name: 'Eve',
          },
          {
            id: 99,
            name: 'Mallory',
          },
        ],
      }
    })
  })

  it('should make selectors for list', () => {

    const { makeSelectors } = rj(
      rjList({
        pageSize: 10,
        pagination: nextPreviousPaginationAdapter
      }),
      {
        effect: () => Promise.resolve(1)
      }
    )()

    const {
      getList,
      getCount,
      getNumPages,
      hasNext,
      hasPrev,
      getNext,
      getPrev,
      getCurrent
    } = makeSelectors()

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
            name: 'Alice',
          },
          {
            id: 23,
            name: 'Bob',
          },
          {
            id: 7,
            name: 'Eve',
          },
        ],
      },
    }
    expect(getList(state)).toBe(state.data.list)
    expect(getCount(state)).toBe(99)
    expect(getNumPages(state)).toBe(10)
    expect(hasNext(state)).toBe(true)
    expect(hasPrev(state)).toBe(false)
    expect(getNext(state)).toBe(state.data.pagination.next)
    expect(getPrev(state)).toBe(null)
    expect(getCurrent(state)).toBe(state.data.pagination.current)
  })

  it('should use fallback reducer', () => {

    const fallbackReducer = jest.fn((state, action) => state);

    const otherPlugin = () => rj({
      reducer: () => fallbackReducer
    })

    const { reducer } = rj(
      otherPlugin(),
      rjList({
        pageSize: 100,
        pagination: nextPreviousPaginationAdapter
      }),
      {
        effect: () => Promise.resolve(1)
      }
    )()

    const prevState = null

    const action = {
      type: 'CUSTOM',
      payload: {
        params: {},
        data: { id: 1 },
      },
    }

    reducer(prevState, action)

    expect(fallbackReducer).toBeCalledWith(null, action)

  })

  it('should get angry if no pagesize is provided', () => {

    expect(() => rjList({ pagination: nextPreviousPaginationAdapter })).toThrow()

  })

  it('should get angry if no pagination is provided', () => {

    expect(() => rjList({ pageSize: 100 })).toThrow()

  })

  it('should get angry if no config is provided', () => {

    expect(() => rjList()).toThrow()

  })

  it('should not break with null state', () => {
    const { makeSelectors } = rj(
      rjList({
        pageSize: 10,
        pagination: nextPreviousPaginationAdapter
      }),
      {
        effect: () => Promise.resolve(1)
      }
    )()

    const {
      getList,
      getCount,
      getNumPages,
      hasNext,
      hasPrev,
      getNext,
      getPrev,
      getCurrent
    } = makeSelectors()

    const state = {
      loading: false,
      error: null,
      data: null,
    }
    expect(getList(state)).toBe(null)
    expect(getCount(state)).toBe(null)
    expect(getNumPages(state)).toBe(null)
    expect(hasNext(state)).toBe(false)
    expect(hasPrev(state)).toBe(false)
    expect(getNext(state)).toBe(null)
    expect(getPrev(state)).toBe(null)
    expect(getCurrent(state)).toBe(null)
  })

  it('should allow custom list reducer', () => {

    const customReducer = jest.fn((oldList, action) => {
      return action.payload.data.results.filter(item => item.name.startsWith('A'))
    })

    const { reducer } = rj(
      rjList({
        pageSize: 100,
        pagination: nextPreviousPaginationAdapter,
        customListReducer: customReducer
      }),
      {
        effect: () => Promise.resolve(1)
      }
    )()

    const prevState = {
      data: {
        list: [],
        pagination: null
      },
      pending: false,
      error: null
    }

    const action = {
      type: SUCCESS,
      payload: {
        params: {},
        data: {
          next: '/my-api?page=2',
          prev: null,
          count: 99,
          results: [
            {
              id: 23,
              name: 'Alice',
            },
            {
              id: 23,
              name: 'Bob',
            },
            {
              id: 7,
              name: 'Eve',
            },
          ],
        },
      },
    }

    const nextState = reducer(prevState, action)

    expect(customReducer).toBeCalledWith(prevState.data.list, action)

    expect(nextState).toEqual({
      pending: false,
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
            name: 'Alice',
          },
        ]
      }
    })

  })

  it('should allow custom pagination reducer', () => {

    const customReducer = jest.fn((oldPagination, action) => {
      return {
        a: 1,
        b: 2,
        c: 3
      }
    })

    const { reducer } = rj(
      rjList({
        pageSize: 100,
        pagination: nextPreviousPaginationAdapter,
        customPaginationReducer: customReducer
      }),
      {
        effect: () => Promise.resolve(1)
      }
    )()

    const prevState = {
      data: {
        list: [],
        pagination: null
      },
      pending: false,
      error: null
    }

    const action = {
      type: SUCCESS,
      payload: {
        params: {},
        data: {
          next: '/my-api?page=2',
          prev: null,
          count: 99,
          results: [
            {
              id: 23,
              name: 'Alice',
            },
            {
              id: 23,
              name: 'Bob',
            },
            {
              id: 7,
              name: 'Eve',
            },
          ],
        },
      },
    }

    const nextState = reducer(prevState, action)

    expect(customReducer).toBeCalledWith(prevState.data.pagination, action)

    expect(nextState).toEqual({
      pending: false,
      error: null,
      data: {
        pagination: {
          a: 1,
          b: 2,
          c: 3
        },
        list: [
          {
            id: 23,
            name: 'Alice',
          },
          {
            id: 23,
            name: 'Bob',
          },
          {
            id: 7,
            name: 'Eve',
          },
        ]
      }
    })

  })

})