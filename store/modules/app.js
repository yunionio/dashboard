import http from '@/utils/http'

export default {
  state: {
    companyInfo: {},
  },
  getters: {
    logo (state) {
      if ((state.companyInfo.logo && state.companyInfo.logo !== '') && (state.companyInfo.logo_format && state.companyInfo.logo_format !== '')) {
        return `data:${state.companyInfo.logo_format};base64,${state.companyInfo.logo}`
      }
      return null
    },
    copyright (state) {
      if (state.companyInfo.copyright && state.companyInfo.copyright !== '') {
        return state.companyInfo.copyright
      }
      return null
    },
  },
  mutations: {
    SET_COMPANY_INFO (state, payload) {
      state.companyInfo = payload
    },
  },
  actions: {
    fetchCompayInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        http.get('/v1/infos/info').then(response => {
          const { data = {} } = response
          commit('SET_COMPANY_INFO', data)
          document.title = data.name || 'OneCloud'
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
  },
}
