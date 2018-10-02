{ rj, compose, makeAction }

rj({
  namespace: 'createStuff',
  effects: {
    // create: ()
  }
})

rj(rjFetch(), {
  namespace: '@users',
  state: 'users',

  effectsConfig: {

  },
  // effects: {
  //   fetch: {
  //     take: takeLatestAndGroupBy,
  //     // takeArgs: 23,
  //     // cancelBy
  //     call: callApi,
  //     run: () => 23,
  //     // need:
  //     // success: function *() {},
  //     // failure
  //   }
 },
})()


  state: 'giova',
  namespace: 'USERS',

  selectors: {
    getCount: getBaseState => state => getBaseState(state).counter,
  },

  // effects:

  effects: {
    fetch: (params) => request.get('/'),
  },

  // effects: {

    *fetch({ api }, params) {
      const token = yield select(getToken)
      yield api(t => params => request.get('/').then(({ body }) => body))
    },
  // }

  actionTypes: ns => {
    FETCH_LOADING: `${ns}FETCH_LOADING`,
  },

  actions: {
    fetch: ({ FETCH }, _ , ns) => (increment) => ({
      type: FETCH_LOADING,
      payload: increment,
    })
  },

  reducer: (_, {  }, ns) => {

    const FETCH_LOADING = `${ns}FETCH_LOADING`
    const FETCH_FAILURE = `${ns}FETCH_FAILURE`
    const FETCH_SUCCESS = `${ns}FETCH_SUCCESS`

    (prevState, { type, payload }) => {
      switch (type) {
        case [_('LOADING')]:

        default:

      }
    }
  },

  // reducer: (ns, { compose, proxy, composeByAction }) => {
  //   return compose(
  //     doStuff(),
  //     another(),
  //   )
  //   return proxy(r => )
  //   return composeByAction({
  //     `XD`: 23,
  //   })
  // }


  // actionReducer: ns => ({
  //   // [`${ns}INC`]:
  //   // a: 2
  //   INCREMENT: ({ counter }, { payload }) => ({ counter + payload }),
  //   SET: ({ counter }, { payload }) => ({ counter: payload })
  // }),

  // composeReducer: [
  //
  // ],

  // proxyReducer:

})
