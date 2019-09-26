import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import modules from './modules'

Vue.use(Vuex)

getSubModules(require.context('../../containers', true, /.\/store\/index.js/))

function getSubModules (r) {
  r.keys().forEach(dir => {
    const data = r(dir).default
    data.namespaced = true
    const dirs = dir.replace('./', '').split('/')
    modules[dirs[0]] = data
  })
}

const store = new Vuex.Store({
  getters,
  modules,
})

export default store
