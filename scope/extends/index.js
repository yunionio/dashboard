const requireComponent = require.context('.', true, /.\/(\w*\/)+index\.(jsx?|vue)$/)
const requireCommonComponent = require.context('@Dashboard/extends', true, /.\/(\w*\/)+index\.(jsx?|vue)$/)

const keys = requireComponent.keys().filter(item => {
  const arr = item.split('/')
  return /index\.(jsx?|vue)$/.test(arr[2])
})
const commonKeys = requireCommonComponent.keys().filter(item => {
  const arr = item.split('/')
  return /index\.(jsx?|vue)$/.test(arr[2])
})
const extendsComponents = {}

commonKeys.forEach(fileName => {
  // 获取组件配置
  if (!keys.includes(fileName)) {
    const componentConfig = requireCommonComponent(fileName)

    const componentName = componentConfig.default.name

    extendsComponents[componentName] = componentConfig.default || componentConfig
  }
})
keys.forEach(fileName => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName)

  const componentName = componentConfig.default.name

  extendsComponents[componentName] = componentConfig.default || componentConfig
})

export default extendsComponents
