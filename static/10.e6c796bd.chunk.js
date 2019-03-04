webpackJsonp([10],{779:function(e,t,n){var a=n(15),o=n(45),i=n(292).PageRenderer;i.__esModule&&(i=i.default);var r=o({displayName:"WrappedPageRenderer",getInitialState:function(){return{content:n(794)}},componentWillMount:function(){},render:function(){return a.createElement(i,Object.assign({},this.props,{content:this.state.content}))}});r.__catalog_loader__=!0,e.exports=r},794:function(e,t){e.exports="Redux-RocketJump is a set of tools designed to speed up the development of a redux-powered application.\r\n\r\n# Why Redux-RocketJump?\r\nRedux is a great tool in state management, but it has a great problem: verbosity.\r\n\r\nActions' and reducers' definitions can require many lines of code (if you care about readability, of course), and this usually ends up in copy - paste - adapt. Moreover, there are recurrent patterns, like pagination, which are not straightforward to implement starting from scratch and that are needed in a great number of projects. Again, this ends up in copypasting stuff, which is, at the end, a bad practice. \r\n\r\nRedux-RocketJump tries to bridge this gap promoting better code organization and automating common tasks without losing control of what you are doing. In detail, it focuses on\r\n- generating all you need for state management (actions, reducers, side effect management) from a single function call\r\n- easing out extension and composition of common data-related patterns\r\n- organizing redux folders by functionality instead of by type\r\n\r\nRedux-RocketJump helps in this scenario, providing tools to reduce verbosity and reuse functionalities across composition. In detail, Redux-RocketJump focuses on\r\n- generating all you need for state management (actions, reducers, side effect management) from a single function call\r\n- easing out extension and composition of common data-related patterns\r\n- organizing redux folders by functionality instead of by type\r\n\r\n# Technology stack\r\nRedux-RocketJump is not simply based on Redux, but on a full-featured redux-powered environment. \r\n\r\nThe enviroment React-RocketJump fits in is composed by the following packages\r\n\r\n- [Redux](https://redux.js.org/), for state management\r\n- [Reselect](https://github.com/reduxjs/reselect), to build memoized selectors\r\n- [Redux-Saga](https://github.com/redux-saga/redux-saga), for side effects management\r\n\r\nIndeed, this environment is quite common in real-life projects. The most viable alternative is replacing Redux-Saga with [Redux-Thunk](https://github.com/reduxjs/redux-thunk). The selection of Redux-Saga instead of Redux-Thunk comes from the fact that Redux-Saga is a more complete and feature rich framework, and allows a more fine grained management of asynchronous tasks with respect to Redux-Thunk, that typically operates at a lower level of abstraction.\r\n\r\n# When to use Redux-RocketJump?\r\nDespite being widely customizable due to its plugin-based architecture, Redux-RocketJump is designed to face issues concerning the integration between REST based APIs and the Redux data flow. Whenever we need to interact with an API we might need to update our state both when we make the request (to track that a request is pending) and when the request completes, and even in presence of errors. Asynchronous tasks, moreover, can become quite cumbersome to manage. Let's think, for instance, to an application requiring some instantaneous search, i.e. a search feature that reacts to every keypress coming from the user. At each key the application will fire an asynchronous call to the data server, but only data coming from the last call are to be delivered to the user. This means that all the previous tasks' outputs had to be discarded. Another problem could be a user leaving a view while data is loading in an asynchronous fashion: typically, we don't want to keep that task running. Redux-RocketJump faces also this problems with appropriate and configurable solutions and tools.\r\n\r\nThe other main reason you might want to use React-RocketJump for is to achieve a better code organization. The typical Redux code organization is to group code files by role: actions, reducers, sagas and selectors regarding the same data live in different folders, mixed up with code playing their same role but dealing with completely different data items. If this could be fine in a small application, when the project gets bigger it could become a problem. Redux-RocketJump is designed with feature-based splitting in mind: code is grouped according to functionality and data managed, and not according to its role. Redux-RocketJump contains some tools to leverage this feature-based code organization in an effective way."}});
//# sourceMappingURL=10.e6c796bd.chunk.js.map