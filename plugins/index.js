import Vue from 'vue'

const plugins = require.context('./', false, /.\/\w+\.(js)$/)

const registerPlugins = (plugins) => {
  const keys = plugins.keys()
  for (let i = 0, len = keys.length; i < len; i++) {
    const item = keys[i]
    if (item.includes('index.js')) continue
    const plugin = plugins(item)
    if (plugin.default.autoRegister === false) continue
    Vue.use(plugin.default)
  }
}

registerPlugins(plugins)
