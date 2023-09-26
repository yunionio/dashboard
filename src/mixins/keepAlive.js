
export default {
  beforeRouteLeave (to, from, next) {
    try {
      const { key: toKey } = to.meta
      const { key: fromKey, keepTargetPath = [] } = from.meta // 跳转到哪些路由需要清除/保留自身cache ['/yyy']
      const cache = this.$vnode.parent.componentInstance.cache
      const keys = this.$vnode.parent.componentInstance.keys
      const list = [...keys]
      list.map(key => {
        if (!keepTargetPath.includes(toKey) && key === fromKey) { // 若跳转目标地址需要原地址keepAlive时，不清除原地址cache
          delete cache[key]
          const index = keys.indexOf(key)
          if (index > -1) {
            keys.splice(index, 1)
          }
        }
      })
    } catch (err) {
      throw Error(err)
    }

    next()
  },
}
