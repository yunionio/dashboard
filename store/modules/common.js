import Vue from 'vue'
import storage from '@/utils/storage'
import { Manager } from '@/utils/manager'

export default {
  state: {
    recentMenus: storage.get('__oc_recent_menus__') || [],
    topAlert: {},
    bill: {
      currency: 'CNY',
      loaded: false,
      currencyOpts: [],
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
  },
  mutations: {
    UPDATE_OBJECT (state, { name, data }) {
      if (!state[name]) state[name] = {}
      Vue.set(state, name, { ...state[name], ...data })
    },
    DELETE_OBJECT (state, { name, key }) {
      Vue.delete(state[name], key)
    },
    SET_BILL_CURRENCY (state, payload) {
      state.bill.currency = payload
    },
    SET_BILL_CURRENCYOPTS (state, payload) {
      state.bill.currencyOpts = payload
    },
    SET_BILL_CURRENCY_LOADED (state, payload) {
      state.bill.loaded = payload
    },
    SET_K8S_CLUSTER (state, payload) {
      state.k8s.cluster = payload
    },
    SET_K8S_NAMESPACE (state, payload) {
      state.k8s.namespace = payload
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
        if (state.bill.loaded) return
        const params = {
          query_type: 'currency',
          ...payload,
        }
        const { data: { data = [] } } = await new Manager('bill_conditions', 'v1').list({ params })
        commit('SET_BILL_CURRENCY_LOADED', true)
        commit('SET_BILL_CURRENCYOPTS', data)
        let currency = ''
        if (data.length) {
          if (data.find(val => val.item_id === 'CNY')) {
            currency = 'CNY'
          } else if (data.find(val => val.item_id === 'USD')) {
            currency = 'USD'
          } else {
            currency = data[0].item_id
          }
        }
        commit('SET_BILL_CURRENCY', currency)
      } catch (error) {
        throw error
      }
    },
  },
}
