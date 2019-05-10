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
        title: 'Uno',
        done: false,
        id: 1
      },
      {
        title: 'Due',
        done: true,
        id: 2
      },
      {
        title: 'Tre',
        done: false,
        id: 3
      },
      {
        title: 'Quattro',
        done: false,
        id: 4
      },
      {
        title: 'Cinque',
        done: false,
        id: 5
      },
    ])
  }
)