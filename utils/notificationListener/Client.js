/**
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/11/21
 * web-push
 * 说明：客户端通知消息处理模块
 * @class Clinet
 */
class Client {
  constructor (store, options) {
    this.server = options.server || process.env.VUE_APP_WEBSCOKET_PATH
    this.server += `/ws?session=${store.getters.auth.auth.session}`
    this.events = {}
    this.errorHandler = () => console.error
    try {
      this.socket = new WebSocket(this.server)
    } catch (error) {
    }
    this.socket.addEventListener('open', evt => {
      // console.log('Connected onecloud push server')
    })

    this.socket.addEventListener('close', evt => {
      // console.log('Disconnect onecloud push server')
    })

    this.socket.addEventListener('error', evt => {
      // console.error(evt)
    })

    this.socket.addEventListener('message', evt => {
      const type = evt.type
      if (!type) {
        // console.info(`未知的类型${type}`)
        return
      }
      if (!this.events[type]) {
        // console.info(`Can't found ${event} process`)
        return
      }
      this.events[type](evt.data)
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
