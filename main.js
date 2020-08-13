import Vue from 'vue'
import Antd from 'ant-design-vue'
import 'xe-utils'
import VXETable from 'vxe-table'
import VXETablePluginAntd from 'vxe-table-plugin-antd'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/mode/yaml/yaml.js'
import 'vxe-table/lib/index.css'
import 'vxe-table-plugin-antd/dist/style.css'
import '@/styles/antd/index.less'
import '@/styles/index.scss'

import store from './store'
import router from './router'
import i18n from './locales'
import App from './App.vue'
import antdGlobalConfig from './plugins/antdGlobalConfig'

import './components'
import './directives'
import './plugins'
import './permission'
import './filters'

Vue.config.productionTip = false

Vue.use(Antd)
Vue.use(VXETable)
Vue.use(antdGlobalConfig)

Vue.prototype.$log = window.console.log
Vue.prototype.$appConfig = {
  isPrivate: process.env.VUE_APP_IS_PRIVATE,
  webConsolePath: process.env.VUE_APP_WEB_CONSOLE_PATH,
}

VXETable.use(VXETablePluginAntd)

const app = new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
})

async function start () {
  try {
    await store.dispatch('app/fetchCompayInfo')
    await store.dispatch('app/fetchWorkflowEnabledKeys')
  } finally {
    app.$mount('#app')
  }
}

window.app = app
window.buildInfo = typeof process.env.VUE_APP_BUILDINFO === 'object' ? JSON.parse(process.env.VUE_APP_BUILDINFO) : null

start()
