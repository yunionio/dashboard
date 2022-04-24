
export default {
  beforeRouteLeave (to, from, next) {
    try {
      const { key } = from.meta
      const { closeTargetPath = [] } = from.meta // 跳转到哪些路由需要清除自身cache ['/yyy']
      const cache = this.$vnode.parent.componentInstance.cache
      const keys = this.$vnode.parent.componentInstance.keys
      closeTargetPath.map(targetPath => {
        if (key && targetPath === to.path && cache[key] !== null) {
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
