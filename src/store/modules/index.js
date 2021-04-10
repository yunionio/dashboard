/**
 * Get Store Modules
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/08/09
 */
const modules = {}

getModules(require.context('.', false, /\.js$/))
getModules(require.context('../../../scope/store/modules', false, /\.js$/))

function getModules (r) {
  r.keys().forEach(fileName => {
    if (fileName === './index.js') return
    const moduleName = fileName.replace(/(\.\/|\.js)/g, '')
    const data = r(fileName).default
    data.namespaced = true
    modules[moduleName] = data
  })
}

export default modules
