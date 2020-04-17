/**
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/11/21
 * web-push
 * 说明：客户端通知消息处理模块
 * @class Clinet
 */
import io from 'socket.io-client'

class Client {
  constructor (store, options = {}) {
    if (!options.session) {
      throw new Error('session is required')
    }
    const { session, server, ...rest } = options
    this.server = server || 'https://office.yunion.io'
    this.events = {}
    this.errorHandler = () => console.error
    this.socket = io(this.server, {
      ...rest,
      query: {
        session,
      },
      reconnection: true,
      autoConnect: false,
    })
    this.socket.on('connect', () => {
      console.info('connected onecloud push server')
    })

    this.socket.on('disconnect', () => {
      console.info('disconnect onecloud push server')
    })

    this.socket.on('error', (error) => {
      console.error(error)
    })

    this.socket.on('message', (message) => {
      const event = message.event
      if (!event) {
        console.info(`未知的类型${event}`)
        return
      }
      if (!this.events[event]) {
        console.info(`can't found ${event} process`)
        return
      }
      this.events[event](message.payload)
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
  start () {
    this.socket.open()
  }
}

export default Client
