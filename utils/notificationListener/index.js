/**
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/11/21
 * Notification Listener
 */

import Client from './Client'
import events from './events'

export default (store, options) => {
  const socket = new Client(store, options)
  events({
    socket,
    store,
    options,
  })
  return socket
}
