import { rj } from 'redux-rocketjump';

const rj1 = rj({
      
})

const rj2 = rj({
  
})

const rj3 = rj(
  rj1,
  rj2
)

const rj4 = rj(
  rj3,
  {
    type: 'r',
    api: () => { },
    state: 'aa',
  }
)();

console.log(rj4);

export const {
    actions,
    reducer,
    selectors,
    saga
} = rj4;