import http from '@/utils/http'

export default {
  state: {
    captcha: false,
    domains: [],
    regions: [],
  },
  mutations: {
    SET_DOMAINS (state, payload) {
      state.domains = payload
    },
    SET_CAPTCHA (state, payload) {
      state.captcha = payload
    },
    SET_REGIONS (state, payload) {
      state.regions = payload
    },
  },
  actions: {
    getRegions ({ commit }) {
      return new Promise((resolve, reject) => {
        http.get('/v1/auth/regions').then(response => {
          const { data = {} } = response
          const { captcha = false, regions = [], domains = [] } = data
          commit('SET_CAPTCHA', captcha)
          commit('SET_REGIONS', regions)
          commit('SET_DOMAINS', domains)
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
  },
}
