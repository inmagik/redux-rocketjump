import configureStore from 'redux-mock-store'
import createSagaMiddleware from 'redux-saga'
import { rj } from '../../../rocketjump'
import rjWithPromise from '../index'
import { middleware as thunkMiddleware } from 'redux-saga-thunk'

const mockStoreWithSagaAndSagaThunk = (saga, ...mockStoreArgs) => {
  const sagaMiddleware = createSagaMiddleware()
  const middlewares = [thunkMiddleware, sagaMiddleware]
  const mockStore = configureStore(middlewares)
  const store = mockStore(...mockStoreArgs)
  sagaMiddleware.run(saga)
  return store
}

describe('Promise plugin', () => {
  it('Should dispatch a promise!', done => {
    const {
      actions: { load },
      saga,
    } = rj(rjWithPromise, {
      type: 'OCIO',
      state: 'X',
      effect: ({ maik }) =>
        new Promise((resolve, reject) => {
          if (maik === 23) {
            resolve({
              message: 'Time 2 Rave on!',
            })
          } else {
            reject('Invalid Maik try again')
          }
        }),
    })()

    const store = mockStoreWithSagaAndSagaThunk(saga, {})
    store.dispatch(load({ maik: 777 })).catch(error => {
      expect(error).toBe('Invalid Maik try again')
      store.dispatch(load({ maik: 23 })).then(data => {
        expect(data).toEqual({
          data: {
            message: 'Time 2 Rave on!',
          },
          params: { maik: 23 },
        })
        done()
      })
    })
  })
})
