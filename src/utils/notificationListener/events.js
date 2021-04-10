/**
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/11/21
 * Events
 */

import { message } from 'ant-design-vue'

export default ({ socket, store, options }) => {
  socket.on('message', (payload) => {
    try {
      const obj = JSON.parse(payload)
      if (!obj.success || !obj.action) {
        return
      }
      const type = obj.success === true ? 'success' : 'warning'
      if (obj.notes && obj.notes.endsWith('type=itsm')) {
        if (obj.broadcast === true && obj.user_id === '') {
          store.dispatch('getAllOpenWorkflowKeys')
        }
        store.dispatch('app/fetchWorkflowStatistics')
        if (obj.notes.startsWith('priority=silence')) {
          return
        }
      }
      message[type](obj.action)
    } catch (error) {
      throw error
    }
  })
}
