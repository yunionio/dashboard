const logo = require('@scope/images/onecloud.svg')

export default {
  state: {
    companyInfo: {
      copyright: 'Made with ❤ Yunion',
      logo,
      loginLogo: logo,
      name: 'OneCloud',
    },
    workflow: {
      statistics: {
        'nr-historic-process-instance': 0,
        'nr-process-task': 0,
      },
      enabledKeys: [],
    },
    // 自定义字典
    dictionary: {
      id: '',
      zh: {},
      en: {},
    },
    oem: {},
  },
  getters: {
    logo (state) {
      return state.companyInfo.logo
    },
    loginLogo (state) {
      return state.companyInfo.loginLogo
    },
    copyright (state) {
      return state.companyInfo.copyright
    },
  },
  mutations: {
    SET_COMPANY_INFO (state, payload) {
      state.companyInfo = payload
    },
  },
  actions: {
    fetchCompayInfo ({ commit, state }) {
      return Promise.resolve(state.companyInfo)
    },
    fetchWorkflowStatistics () {
      return Promise.resolve()
    },
    fetchWorkflowEnabledKeys () {
      return Promise.resolve()
    },
    fetchDictionary ({ commit }, payload) {
      return Promise.resolve()
    },
    fetchOEM ({ commit }, payload) {
      return Promise.resolve()
    },
  },
}
