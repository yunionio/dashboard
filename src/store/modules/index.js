/**
 * Get Store Modules
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/08/09
 */

const requireModule = require.context('.', false, /\.js$/)
const modules = {}

requireModule.keys().forEach(fileName => {
  if (fileName === './index.js') return
  const moduleName = fileName.replace(/(\.\/|\.js)/g, '')
  const data = requireModule(fileName).default
  data.namespaced = true
  modules[moduleName] = data
})

export default modules
