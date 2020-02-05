import request from 'superagent'
import { rj, combineRjs, makeMutationActionTypes } from 'redux-rocketjump'

const API_URL = `http://${window.location.hostname}:9001`

const combineConf = {}

const GET_SBATTE_TODOS = 'GET_SBATTE_TODOS'
const GET_TODOS = 'GET_TODOS'

const ON_ADD_TODO = makeMutationActionTypes(GET_TODOS, 'addTodo').success

combineConf.sbatte = rj({
  type: GET_SBATTE_TODOS,
  computed: {
    todos: 'getData',
    loading: 'isLoading',
    adding: '@mutation.addTodo.pending',
    updating: '@mutation.updateTodo.pendings',
    deleting: '@mutation.deleteTodo.pendings',
  },
  composeReducer: (state, action) => {
    switch (action.type) {
      case ON_ADD_TODO: {
        const newTodo = action.payload.data
        return {
          ...state,
          data: state.data.concat({
            ...newTodo,
            id: `~sbatte~${newTodo.id}`,
            title: `${newTodo.title} 2X`,
          }),
        }
      }
      default:
        return state
    }
  },
  mutations: {
    addTodo: rj.mutation.single({
      updater: (state, newTodo) => ({
        ...state,
        data: state.data.concat(newTodo),
      }),
      effect: todo =>
        request
          .post(`${API_URL}/sbatteTodos`)
          .send(todo)
          .then(({ body }) => body),
    }),
    updateTodo: rj.mutation.multi(todo => todo.id, {
      updater: (state, updatedTodo) => ({
        ...state,
        data: state.data.map(todo =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        ),
      }),
      effect: todo =>
        request
          .put(`${API_URL}/sbatteTodos/${todo.id}`)
          .send(todo)
          .then(({ body }) => body),
    }),
    deleteTodo: rj.mutation.multi(todo => todo.id, {
      updater: (state, deletedTodo) => ({
        ...state,
        data: state.data.filter(todo => todo.id !== deletedTodo.id),
      }),
      effect: todo =>
        request.delete(`${API_URL}/sbatteTodos/${todo.id}`).then(() => todo),
    }),
  },
  effect: (...args) => {
    return request.get(`${API_URL}/sbatteTodos`).then(({ body }) => body)
  },
})

combineConf.normal = rj({
  type: GET_TODOS,
  computed: {
    todos: 'getData',
    loading: 'isLoading',
    adding: '@mutation.addTodo.pending',
    updating: '@mutation.updateTodo.pendings',
    deleting: '@mutation.deleteTodo.pendings',
  },
  mutations: {
    addTodo: rj.mutation.single({
      updater: (state, newTodo) => ({
        ...state,
        data: state.data.concat(newTodo),
      }),
      effect: todo =>
        request
          .post(`${API_URL}/todos`)
          .send(todo)
          .then(({ body }) => body),
    }),
    updateTodo: rj.mutation.multi(todo => todo.id, {
      updater: (state, updatedTodo) => ({
        ...state,
        data: state.data.map(todo =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        ),
      }),
      effect: todo =>
        request
          .put(`${API_URL}/todos/${todo.id}`)
          .send(todo)
          .then(({ body }) => body),
    }),
    deleteTodo: rj.mutation.multi(todo => todo.id, {
      updater: (state, deletedTodo) => ({
        ...state,
        data: state.data.filter(todo => todo.id !== deletedTodo.id),
      }),
      effect: todo =>
        request.delete(`${API_URL}/todos/${todo.id}`).then(() => todo),
    }),
  },
  effect: (...args) => {
    return request.get(`${API_URL}/todos`).then(({ body }) => body)
  },
})

export const {
  rjs: { sbatte: ReduxSbatteTodos, normal: ReduxTodos },
  reducer,
  saga,
} = combineRjs(combineConf, {
  state: 'todos',
})
