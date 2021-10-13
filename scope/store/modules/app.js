import http from '@/utils/http'
import { getRequestT } from '@/utils/utils'
const logo = require('@scope/images/cloudpod_logo.svg')
const loginLogo = require('@scope/images/cloudpod_login_logo.svg')

export default {
  state: {
    companyInfo: {
      copyright: 'Made with ❤ Cloudpods',
      logo,
      loginLogo,
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
    alertresource: {
      data: [],
      total: 0,
    },
    alertrecords: {
      data: [],
      total: 0,
    },
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
    SET_ALERTRESOURCE (state, payload) {
      state.alertresource = payload
    },
    SET_ALERTRECORDS (state, payload) {
      state.alertrecords = payload
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
    /**
     * @description 获取oem信息
     */
    fetchAlertresource ({ commit, rootGetters }, payload) {
      const params = { scope: rootGetters.scope, limit: 20, $t: getRequestT() }
      return new Promise((resolve, reject) => {
        http.get('/v1/alertresources', { params }).then(response => {
          const data = response.data || {}
          commit('SET_ALERTRESOURCE', data)
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    /**
     * @description 获取监控策略告警数
     */
    fetchAlertingrecords ({ commit, rootGetters }, payload) {
      const params = { scope: rootGetters.scope, limit: 20, alerting: true, $t: getRequestT() }
      return new Promise((resolve, reject) => {
        http.get('/v1/alertrecords', { params }).then(response => {
          const data = response.data || {}
          commit('SET_ALERTRECORDS', data)
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
  },
}
