webpackJsonp([1],{791:function(n,r,e){var t=e(15),o=e(45),a=e(292).PageRenderer;a.__esModule&&(a=a.default);var s=o({displayName:"WrappedPageRenderer",getInitialState:function(){return{content:e(806)}},componentWillMount:function(){},render:function(){return t.createElement(a,Object.assign({},this.props,{content:this.state.content}))}});s.__catalog_loader__=!0,n.exports=s},806:function(n,r){n.exports="This plugin adds `Promise`s to action dispatchers using the awesome library `redux-saga-thunk`.\r\n\r\n```code\r\nlang: js\r\n---\r\nimport rjWithPromise from 'redux-rocketjump/plugins/promise'\r\n\r\nconst {\r\n    actions: {\r\n        load,\r\n        unload,\r\n    },\r\n    saga,\r\n} = rj(\r\n      rjWithPromise,\r\n      {\r\n          type: 'GET_TODOS',\r\n          state: 'todos',\r\n          api: loadTodosFromApi,\r\n      }\r\n    )()\r\n\r\n// ... next ...\r\nstore.dispatch(load())\r\n  .then(() => /* ... */)\r\n  .catch(() => /* ... */)\r\n```"}});
//# sourceMappingURL=1.47847f48.chunk.js.map