/**
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/11/21
 * web-push
 * 说明：客户端通知消息处理模块
 * @class Clinet
 */
import io from 'socket.io-client'
import { message } from 'ant-design-vue'

class Client {
  constructor (store, options = {}) {
    const { server, ...rest } = options
    this.server = server || 'https://office.yunion.io'
    this.events = {}
    this.errorHandler = () => console.error
    this.socket = io(this.server, {
      ...rest,
      query: {},
      transports: ['websocket'],
      reconnection: true,
      autoConnect: false,
    })
    this.socket.on('connect', () => {
      console.info('connected push server')
    })

    this.socket.on('disconnect', () => {
      console.info('disconnect push server')
    })

    this.socket.on('error', (error) => {
      console.error(error)
    })

    this.socket.on('message', (payload) => {
      try {
        const obj = JSON.parse(payload)
        if (!obj.success || !obj.action || obj.ignore_alert) {
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
        console.log(payload)
      }
      // const event = message.event
      // console.log(message)
      // if (!event) {
      //   console.info(`未知的类型${event}`)
      //   return
      // }
      // if (!this.events[event]) {
      //   console.info(`can't found ${event} process`)
      //   return
      // }
      // this.events[event](message.payload)
    })
  }

  error (cb) {
    this.errorHandler = cb
  }

  on (name, cb) {
    this.events[name] = cb
  }

  getSocket () {
    return this.socket
  }
}

export default Client
