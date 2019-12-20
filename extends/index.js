const requireComponent = require.context('.', true, /.\/(\w*\/)+index\.(jsx?|vue)$/)

const keys = requireComponent.keys().filter(item => {
  const arr = item.split('/')
  return /index\.(jsx?|vue)$/.test(arr[2])
})
const extendsComponents = {}
const options = {}

keys.forEach(fileName => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName)

  const componentName = componentConfig.default.name

  extendsComponents[componentName] = componentConfig.default || componentConfig
  options[componentName] = componentConfig.options
})

export const extendsOptions = options

export default extendsComponents
