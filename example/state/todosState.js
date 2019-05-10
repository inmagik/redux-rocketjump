import { rj as reactRj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'

export const TodosListState = reactRj(
  rjPlainList(),
  {
    effect: () => Promise.resolve([
      {
        title: 1,
        done: false,
        id: 0
      },
      {
        title: 2,
        done: true,
        id: 1
      },
      {
        title: 3,
        done: false,
        id: 2
      },
      {
        title: 4,
        done: false,
        id: 3
      },
      {
        title: 5,
        done: false,
        id: 4
      },
    ])
  }
)