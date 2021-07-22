import Vue from 'vue'
import storage from '@/utils/storage'
import { getCurrency, setCookieVal, getExchangeRateAvailable } from '@/utils/common/cookie'
import { Manager } from '@/utils/manager'

export default {
  state: {
    recentMenus: storage.get('__oc_recent_menus__') || [],
    topAlert: {},
    bill: {
      currency: getCurrency() || '',
      currencyOpts: [],
      exchangeRateAvailable: getExchangeRateAvailable() || true,
      globalConfig: {},
    },
    k8s: {
      cluster: undefined,
      namespace: undefined,
    },
    lbRedirected: {},
    // 菜单栏
    sidebar: {},
    jsonschema: {
      sku: {},
    },
    globalConfig: {},
    openCloudShell: false,
  },
  mutations: {
    UPDATE_OBJECT (state, { name, data }) {
      if (!state[name]) Vue.set(state, name, {})
      Vue.set(state, name, { ...state[name], ...data })
    },
    DELETE_OBJECT (state, { name, key }) {
      Vue.delete(state[name], key)
    },
    SET_BILL_CURRENCY (state, payload) {
      setCookieVal('currency', payload)
      state.bill.currency = payload
    },
    SET_BILL_CURRENCYOPTS (state, payload) {
      if (!state.bill.exchangeRateAvailable) {
        state.bill.currencyOpts = payload
      } else {
        // 添加以汇率为单位的某个账单
        state.bill.currencyOpts = payload.map(item => {
          return {
            item_id: '_' + item.item_id,
            item_name: '_' + item.item_name,
          }
        })
      }
    },
    SET_BILL_EXCHANGE_RATE_AVAILABLE (state, payload) {
      setCookieVal('exchangeRateAvailable', payload)
      state.bill.exchangeRateAvailable = payload
      // 更新账单选择类型
      const optsList = state.bill.currencyOpts.filter(item => item.item_id === -1)
      this.commit('SET_BILL_CURRENCYOPTS', optsList)
    },
    SET_K8S_CLUSTER (state, payload) {
      state.k8s.cluster = payload
    },
    SET_K8S_NAMESPACE (state, payload) {
      state.k8s.namespace = payload
    },
    REST_BILL_CURRENCY (state) {
      state.bill.currencyOpts = []
    },
    SET_GLOBAL_CONFIG (state, payload) {
      state.globalConfig = payload
    },
    SET_GLOBAL_BILL_CONFIG (state, payload) {
      state.bill.globalConfig = payload
    },
    SET_OPEN_CLOUDSHELL (state, payload) {
      state.openCloudShell = payload
    },
  },
  actions: {
    updateObject ({ commit }, payload) {
      commit('UPDATE_OBJECT', payload)
    },
    deleteObject ({ commit }, payload) {
      commit('DELETE_OBJECT', payload)
    },
    async fetchCurrency ({ commit, state, ...ret }, payload = {}) {
      try {
        const params = {
          query_type: 'currency',
          ...payload,
        }
        const { data: { data = [] } } = await new Manager('bill_conditions', 'v1').list({ params })
        commit('SET_BILL_EXCHANGE_RATE_AVAILABLE', data && data[0] ? data[0].exchange_rate_available || false : true)
        commit('SET_BILL_CURRENCYOPTS', data)
        if (data && data.length > 0) {
          const currencyList = data
          if (data[0].exchange_rate_available) {
            data.map(item => {
              currencyList.push({
                item_id: '_' + item.item_id,
                item_name: '_' + item.item_name,
              })
            })
          }
          const isExsit = currencyList.find(v => v.item_id === state.bill.currency)
          commit('SET_BILL_CURRENCY', isExsit ? state.bill.currency : data[0].item_id)
        }
      } catch (error) {
        throw error
      }
    },
    async fetchGlobalConfig ({ commit }) {
      let manager = new Manager('services', 'v1')
      try {
        const response = await manager.list({
          params: {
            type: ['common', 'meter'],
          },
        })
        const id = response?.data?.data[0]?.id || ''
        if (id) {
          const configResponse = await manager.getSpecific({
            id,
            spec: 'config',
          })
          const config = (configResponse.data.config && configResponse.data.config.default) || {}
          commit('SET_GLOBAL_CONFIG', config)
        }
        const mneterId = response?.data?.data[0]?.id || ''
        if (id) {
          const configResponse = await manager.getSpecific({
            id: mneterId,
            spec: 'config',
          })
          const config = (configResponse.data.config && configResponse.data.config.default) || {}
          commit('SET_GLOBAL_BILL_CONFIG', config)
        }
      } catch (error) {
        throw error
      } finally {
        manager = null
      }
    },
  },
}
