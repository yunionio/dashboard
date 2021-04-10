/**
 * We register all the components so future yunion plugins
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/08/07
 */
import Vue from 'vue'

const requireComponent = require.context('.', true, /.\/(\w*\/)+index\.(jsx?|vue)$/)

const keys = requireComponent.keys().filter(item => {
  const arr = item.split('/')
  return /index\.(jsx?|vue)$/.test(arr[2])
})

keys.forEach(fileName => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName)

  const componentName = componentConfig.default.name

  // 全局注册组件
  Vue.component(
    componentName,
    // 如果这个组件选项是通过 `export default` 导出的，
    // 那么就会优先使用 `.default`，
    // 否则回退到使用模块的根。
    componentConfig.default || componentConfig,
  )
})
