import storage from '@/utils/storage'
import http from '@/utils/http'

const STORAGE_DOMAIN_KEY = '__oc_selected_domain__'
const STORAGE_PROJECT_KEY = '__oc_selected_project__'

export default {
  state: {
    domain: storage.get(STORAGE_DOMAIN_KEY) || {},
    project: storage.get(STORAGE_PROJECT_KEY) || {},
  },
  mutations: {
    SET_DOMAIN (state, domain) {
      storage.set(STORAGE_DOMAIN_KEY, domain)
      state.domain = domain
    },
    SET_PROJECT (state, project) {
      storage.set(STORAGE_PROJECT_KEY, project)
      state.project = project
    },
  },
  actions: {
    async getDomainById ({ commit }, payload = {}) {
      try {
        const { data } = await http.get('/v1/domains/' + payload.key)
        return Promise.resolve(data)
      } catch (err) {
        commit('SET_DOMAIN', {})
      }
    },
    async getProjectById ({ commit, state }, payload = {}) {
      try {
        const { data } = await http.get('/v1/projects/' + payload.key, { params: { project_domain: payload.project_domain || state.domain?.key } })
        if (data) {
          commit('SET_PROJECT', payload)
        }
        return Promise.resolve(data)
      } catch (err) {
        commit('SET_PROJECT', {})
      }
    },
  },
}
