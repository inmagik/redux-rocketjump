import {
  makeUpdateReducer,
  makeRemoveListReducer,
  makeAddListReducer,
} from '../plugins/hor'

describe('HOR makeUpdateReducer', () => {
  it('should immutable update an object', () => {
    const reducer = makeUpdateReducer('KILL_GHOST')
    const prevState = {
      loading: false,
      log: ['~'],
      data: {
        id: 23,
        name: 'Gio Va',
        work: 'Monkey Teacher',
      },
    }
    const action = {
      type: 'KILL_GHOST_SUCCESS',
      meta: { id: 23 },
      payload: {
        data: {
          id: 23,
          name: '@theReal',
          work: 'Pick Up Girlz',
        },
      },
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual({
      loading: false,
      log: ['~'],
      data: {
        id: 23,
        name: '@theReal',
        work: 'Pick Up Girlz',
      },
    })
    // Immutability check
    expect(nextState).not.toBe(prevState)
    expect(nextState.data).not.toBe(prevState.data)
    expect(nextState.log).toBe(prevState.log)
  })

  it('should immutable update a list', () => {
    const reducer = makeUpdateReducer('KILL_GHOST')
    const prevState = {
      loading: false,
      log: ['~'],
      data: [
        {
          id: 23,
          name: 'Gio Va',
          work: 'Monkey Teacher',
        },
        {
          id: 777,
          name: 'DarkSide',
          work: 'DPG',
        },
        {
          id: 69,
          name: 'Liza',
          work: 'Selling Shit',
        },
      ],
    }
    const action = {
      type: 'KILL_GHOST_SUCCESS',
      meta: { id: 777 },
      payload: {
        data: {
          id: 777,
          name: 'DarkSide',
          work: 'N/A',
        },
      },
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual({
      loading: false,
      log: ['~'],
      data: [
        {
          id: 23,
          name: 'Gio Va',
          work: 'Monkey Teacher',
        },
        {
          id: 777,
          name: 'DarkSide',
          work: 'N/A',
        },
        {
          id: 69,
          name: 'Liza',
          work: 'Selling Shit',
        },
      ],
    })
    // Immutability check
    expect(nextState).not.toBe(prevState)
    expect(nextState.data).not.toBe(prevState.data)
    expect(nextState.log).toBe(prevState.log)
  })

  it('should immutable update nested path', () => {
    const reducer = makeUpdateReducer(
      'KILL_GHOST',
      'data.friends.best.withMoney'
    )
    const prevState = {
      loading: false,
      log: ['~'],
      data: {
        id: 23,
        name: 'Gio Va',
        friends: {
          other: {},
          best: {
            withMoney: {
              id: 10,
              name: 'MR M$X',
            },
          },
        },
      },
    }
    const action = {
      type: 'KILL_GHOST_SUCCESS',
      meta: { id: 10 },
      payload: {
        data: {
          id: 10,
          name: 'DAN',
        },
      },
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual({
      loading: false,
      log: ['~'],
      data: {
        id: 23,
        name: 'Gio Va',
        friends: {
          other: {},
          best: {
            withMoney: {
              id: 10,
              name: 'DAN',
            },
          },
        },
      },
    })
    // Immutability check
    expect(nextState).not.toBe(prevState)
    expect(nextState.data).not.toBe(prevState.data)
    expect(nextState.data.friends.best.withMoney).not.toBe(
      prevState.data.friends.best.withMoney
    )
    expect(nextState.data.friends.other).toBe(prevState.data.friends.other)
  })

  it('should match using custom matcher', () => {
    const reducer = makeUpdateReducer('KILL_GHOST', 'data', (action, obj) => {
      return action.payload.data.age === obj.age
    })
    const prevState = {
      loading: false,
      log: ['~'],
      data: {
        id: 23,
        name: 'Gio Va',
        age: 25,
      },
    }
    const action = {
      type: 'KILL_GHOST_SUCCESS',
      meta: { id: 10 },
      payload: {
        data: {
          id: 10,
          age: 25,
          name: 'DAN',
        },
      },
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual({
      loading: false,
      log: ['~'],
      data: {
        id: 10,
        age: 25,
        name: 'DAN',
      },
    })
    // Immutability check
    expect(nextState).not.toBe(prevState)
    expect(nextState.data).not.toBe(prevState.data)
    expect(nextState.log).toBe(prevState.log)
  })

  it('should skyp different action', () => {
    const reducer = makeUpdateReducer('KILL_GHOST', 'data')
    const prevState = {
      loading: false,
      log: ['~'],
      data: {
        id: 23,
        name: 'Gio Va',
        age: 25,
      },
    }
    const action = {
      type: 'KILL_GHOST_FAILURE',
      meta: { id: 10 },
      payload: {
        data: {
          id: 10,
          age: 25,
          name: 'DAN',
        },
      },
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual({
      loading: false,
      log: ['~'],
      data: {
        id: 23,
        name: 'Gio Va',
        age: 25,
      },
    })
    // Immutability check
    expect(nextState).toBe(prevState)
    expect(nextState.data).toBe(prevState.data)
    expect(nextState.log).toBe(prevState.log)
  })

  it('should match a list of action type success', () => {
    const reducer = makeUpdateReducer(
      ['KILL_GHOST', 'SACRIFICE_VIRGIN'],
      'data'
    )
    const prevState = {
      loading: false,
      log: ['~'],
      data: {
        id: 23,
        name: 'Gio Va',
        age: 25,
      },
    }
    const action = {
      type: 'SACRIFICE_VIRGIN_SUCCESS',
      meta: { id: 23 },
      payload: {
        data: {
          id: 23,
          name: 'Papa Emeritus II',
          age: Infinity,
        },
      },
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual({
      loading: false,
      log: ['~'],
      data: {
        id: 23,
        name: 'Papa Emeritus II',
        age: Infinity,
      },
    })
    // Immutability check
    expect(nextState).not.toBe(prevState)
    expect(nextState.data).not.toBe(prevState.data)
    expect(nextState.log).toBe(prevState.log)
  })

  it('should update using custom updater', () => {
    const reducer = makeUpdateReducer(
      'KILL_GHOST',
      'data',
      undefined,
      (action, data) => ({
        ...data,
        money: action.payload + data.money,
      })
    )
    const prevState = {
      loading: false,
      log: ['~'],
      data: {
        id: 23,
        name: 'Gio Va',
        money: 11,
        age: 25,
      },
    }
    const action = {
      type: 'KILL_GHOST_SUCCESS',
      meta: { id: 23 },
      payload: 999,
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual({
      loading: false,
      log: ['~'],
      data: {
        id: 23,
        name: 'Gio Va',
        money: 1010,
        age: 25,
      },
    })
    // Immutability check
    expect(nextState).not.toBe(prevState)
    expect(nextState.data).not.toBe(prevState.data)
    expect(nextState.log).toBe(prevState.log)
  })
})

describe('HOR makeRemoveListReducer', () => {
  it('should remove item from list', () => {
    const reducer = makeRemoveListReducer('RM_RF')
    const prevState = {
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
            id: 11,
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
        ],
      },
    }
    const action = {
      type: 'RM_RF_SUCCESS',
      meta: { id: 23 },
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual({
      loading: false,
      error: null,
      data: {
        pagination: {
          count: 98,
          current: { page: 1 },
          next: { page: 2 },
          previous: null,
        },
        list: [
          {
            id: 11,
            name: 'Gio Va',
          },
          {
            id: 7,
            name: 'Skinny Boy',
          },
        ],
      },
    })
  })
})

describe('HOR makeAddListReducer', () => {
  it('should add item from list', () => {
    const reducer = makeAddListReducer('ADD_SOCIO')
    const prevState = {
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
            id: 11,
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
        ],
      },
    }
    const action = {
      type: 'ADD_SOCIO_SUCCESS',
      payload: {
        data: {
          id: 777,
          name: 'Dark Side',
        },
      },
    }
    const nextState = reducer(prevState, action)
    expect(nextState).toEqual({
      loading: false,
      error: null,
      data: {
        pagination: {
          count: 100,
          current: { page: 1 },
          next: { page: 2 },
          previous: null,
        },
        list: [
          {
            id: 11,
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
            id: 777,
            name: 'Dark Side',
          },
        ],
      },
    })
  })
})
