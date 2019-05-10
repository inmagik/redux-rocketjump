import { rj as reactRj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import rjListInsert from 'react-rocketjump/plugins/listInsert'
import rjListUpdate from 'react-rocketjump/plugins/listUpdate'
import rjListDelete from 'react-rocketjump/plugins/listDelete'

const API_URL = `http://${window.location.hostname}:3000`

export const TodosListState = reactRj(
  rjPlainList(),
  rjListInsert(),
  rjListUpdate(),
  rjListDelete(),
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