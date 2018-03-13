import request from 'superagent'
import {
  rocketjump,
  makeActionTypes,
  composeReducers,
  takeEveryAndCancel,
  takeLatestAndCancelGroupBy,
} from 'redux-rocketjump'
import { fork, put } from 'redux-saga/effects'

const API_URL = 'http://localhost:3000'

// const TOGGLE_TODO = 'TOGGLE_TODO'
// export const {
//   actions: {
//     load: togggleTodo,
//   },
//   saga: togleTodoSa,
// } = rocketjump({
//   type: ADD_TODO,
//   takeAction: takeEveryAndCancel,
//   proxyActions: {
//     load: ({ load }) => todo => {
//       pushing++
//       return load(todo, { _id: `pushing-${pushing}` })
//     }
//   },
//   // you can keep track of loading or error if u want
//   // state: '...',
//   api: todo => request.post(`${API_URL}/todos`)
//     .send(todo)
//     .then(({ body }) => body),
// })()
//
// // Pushing shitty todos (naive implementation of uniq...)
// let pushing = 0
// const ADD_TODO = 'ADD_TODO'
// export const {
//   actions: {
//     load: addTodo,
//   },
//   saga: addTodoSaga,
// } = rocketjump({
//   type: ADD_TODO,
//   takeAction: takeEveryAndCancel,
//   proxyActions: {
//     load: ({ load }) => todo => {
//       pushing++
//       return load(todo, { _id: `pushing-${pushing}` })
//     }
//   },
//   // you can keep track of loading or error if u want
//   // state: '...',
//   api: todo => request.post(`${API_URL}/todos`)
//     .send(todo)
//     .then(({ body }) => body),
// })()
//
// const addTodoReducer = (prevState, { type, payload, meta }) => {
//   const addTodosActions = makeActionTypes(ADD_TODO)
//   switch (type) {
//     case ADD_TODO:
//       return {
//         ...prevState,
//         data: prevState.data.concat({
//           ...payload.params,
//           id: meta._id,
//         }),
//       }
//     case addTodosActions.success:
//       return {
//         ...prevState,
//         data: prevState.data.map(todo => (
//           todo.id === meta._id ? payload.data : todo
//         ))
//       }
//     default:
//       return prevState
//   }
// }


const coolJump = config => rocketjump({
  takeEffect: takeLatestAndCancelGroupBy,
  takeEffectArgs: [config.groupBy],
  successEffect: function *(data, params) {
    console.log('Giooooova successEffect')
  },

})(config)

const GET_TODOS = 'GET_TODOS'
export const {
  actions: {
    load: loadTodos,
  },
  selectors: {
    getData: getTodos,
    isLoading: areTodosLoading,
  },
  reducer,
  saga: todoListSaga,
} = coolJump({
  type: GET_TODOS,
  groupBy: ({ payload: { params }, meta }) => {
    return meta.giova
  },
  apiExtraParams: function *() {
    console.log(23)
    return { giova: 23 }
  },
  successEffect: [function *(data, params) {
    console.log('GOd bless the drug', data, params)
  }],
  // proxyReducer: reducer => composeReducers(reducer, addTodoReducer),
  state: 'todos',
  api: () => request.get(`${API_URL}/todos`).then(({ body }) => body),
})

// console.log('~', todoListSaga)

export const saga = function*() {
  yield fork(todoListSaga)
  // yield fork(addTodoSaga)
}
