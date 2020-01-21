import request from 'superagent'
import { rj } from 'redux-rocketjump'

const API_URL = `http://${window.location.hostname}:9001`

const GET_TODOS = 'GET_TODOS'
export const ReduxTodos = rj({
  type: GET_TODOS,
  state: 'todos',
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
})()

export const { reducer, saga } = ReduxTodos
