import './config/vue.config'
import Vue from 'vue'
import Antd from 'ant-design-vue'
import 'xe-utils'
// import '../mock'
import VXETable from 'vxe-table'
import VXETablePluginAntd from 'vxe-table-plugin-antd'

import './styles/less/index.less'
import './styles/scss/index.scss'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/mode/yaml/yaml.js'

import { uuid } from '@/utils/utils'
import '@/utils/polyfill'

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

Vue.use(Antd)
Vue.use(VXETable, {
  i18n: key => i18n.t(key),
})
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
    await store.dispatch('app/fetchWorkflowEnabledKeys', { $t: uuid() })
    store.dispatch('common/fetchGlobalServices', { $t: uuid() })
  } finally {
    app.$mount('#app')
  }
}

window.app = app
window.buildInfo = process.env.VUE_APP_BUILDINFO
document.title = process.env.VUE_APP_IS_PRIVATE ? '' : 'Cloudpods'

start()
