class EventBus {
  constructor (vue) {
    if (!this.handles) {
      Object.defineProperty(this, 'handles', {
        value: {},
        enumerable: false,
      })
    }
    this.Vue = vue
    this.eventMapUid = {} // _uid和EventName的映射
  }

  setEventMapUid (uid, eventName) {
    if (!this.eventMapUid[uid]) this.eventMapUid[uid] = []
    this.eventMapUid[uid].push(eventName) // 把每个_uid订阅的事件名字push到各自uid所属的数组里
  }

  $on (eventName, callback, vm) { // vm是在组件内部使用时组件当前的this用于取_uid
    if (!this.handles[eventName]) this.handles[eventName] = []
    this.handles[eventName].push(callback)
    if (vm instanceof this.Vue) this.setEventMapUid(vm._uid, eventName)
  }

  $emit () {
    const args = [...arguments]
    const eventName = args[0]
    const params = args.slice(1)
    if (this.handles[eventName]) {
      const len = this.handles[eventName].length
      for (let i = 0; i < len; i++) {
        this.handles[eventName][i](...params)
      }
    }
  }

  $offVmEvent (uid) {
    const currentEvents = this.eventMapUid[uid] || []
    currentEvents.forEach(event => {
      this.$off(event)
    })
  }

  $off (eventName) {
    delete this.handles[eventName]
  }
}

export default {
  install: (Vue, option) => {
    Vue.prototype.$bus = new EventBus(Vue)
    Vue.mixin({
      beforeDestroy () {
        this.$bus.$offVmEvent(this._uid) // 拦截beforeDestroy钩子自动销毁自身所有订阅的事件
      },
    })
  },
}
