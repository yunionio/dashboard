export default {
  methods: {
    /*
    * route base on current path
    * 特定符号：
    * . 表示当前目录
    * .. 表示上级目录
    * @ 表示从指定位置开始路由
    * */
    jumpTo (path) {
      path = path.trim()
      if (path.length === 0) {
        console.warn(`current path ${this.$route.path}, path jump to is empty`)
        return
      }

      // 绝对路径
      if (path.startsWith('/')) {
        this.$router.push(path)
        return
      }

      let curPath = this.$route.path
      if (curPath.endsWith('/')) { curPath = curPath.slice(0, curPath.length - 1) }
      const pathSegs = curPath.split('/')
      // 重新定位路径
      if (path.startsWith('@')) {
        const _path = path.slice(1, path.length)
        const startLocation = _path.split('/')[0]
        const i = pathSegs.indexOf(startLocation)
        if (i > 0) {
          this.$router.push(pathSegs.slice(0, i).join('/') + '/' + _path)
        } else if (i === 0) {
          this.$router.push('/')
        } else {
          // 没有找到
          this.$router.push(_path)
        }
        return
      }

      // 相对路径
      let slashCount = 0
      let _path = ''
      for (let i = 0; i < path.length; i++) {
        const char = path.charAt(i)
        if (char === '.') {
          slashCount += 1
        } else {
          if (char === '/') {
            _path = path.slice(i, path.length)
            break
          } else {
            // 以.开头的相对路径
            this.$router.push(curPath + '/' + path)
            return
          }
        }
      }

      // 跳转到相对路径
      if (pathSegs.length < slashCount) {
        console.warn(`current path ${this.$route.path}, input path ${path}, path jump to is ${_path}`)
        this.$router.push(_path)
      } else {
        const _pathSegs = pathSegs.slice(0, pathSegs.length - slashCount + 1)
        this.$router.push(_pathSegs.join('/') + _path)
      }
    },
  },
}
