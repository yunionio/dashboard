import Vue from 'vue'
import Antd from 'ant-design-vue'
import 'xe-utils'
import VXETable from 'vxe-table'
import VXETablePluginAntd from 'vxe-table-plugin-antd'

import 'vxe-table/lib/index.css'
import 'vxe-table-plugin-antd/dist/style.css'
import '@/styles/antd/index.less'
import '@/styles/index.scss'

import './components'
import './directives'

import store from './store'
import router from './router'
import i18n from './locales'
import http from './plugins/http'
import validate from './plugins/validate'
import moment from './plugins/moment'
import eventBus from './plugins/eventBus'
import list from './plugins/list'
import clipboard from './plugins/clipboard'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(Antd)
Vue.use(http)
Vue.use(validate)
Vue.use(VXETable)
Vue.use(moment)
Vue.use(eventBus)
Vue.use(list)
Vue.use(clipboard)

Vue.prototype.$log = window.console.log

VXETable.use(VXETablePluginAntd)

const app = new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
})

async function start () {
  app.$mount('#app')
}

start()
