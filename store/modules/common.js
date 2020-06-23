import Vue from 'vue'
import * as R from 'ramda'
import storage from '@/utils/storage'
import http from '@/utils/http'

const storageRecentMenusKey = '__oc_recent_menus__'

export default {
  state: {
    recentMenus: storage.get(storageRecentMenusKey) || [],
    topAlert: {},
    bill: {
      currency: 'CNY',
    },
    k8s: {
      cluster: undefined,
      namespace: undefined,
    },
    lbRedirected: {},
    isShowSystemResource: false,
  },
  mutations: {
    UPDATE_OBJECT (state, { name, data }) {
      if (!state[name]) state[name] = {}
      Vue.set(state, name, { ...state[name], ...data })
    },
    DELETE_OBJECT (state, { name, key }) {
      Vue.delete(state[name], key)
    },
    SET_RECENT_MENUS (state, payload) {
      state.recentMenus = payload
    },
    SET_BILL_CURRENCY (state, payload) {
      state.bill.currency = payload
    },
    SET_K8S_CLUSTER (state, payload) {
      state.k8s.cluster = payload
    },
    SET_K8S_NAMESPACE (state, payload) {
      state.k8s.namespace = payload
    },
    SET_IS_SHOW_SYSTEM_RESOURCE (state, payload) {
      state.isShowSystemResource = payload
    },
  },
  actions: {
    updateObject ({ commit }, payload) {
      commit('UPDATE_OBJECT', payload)
    },
    deleteObject ({ commit }, payload) {
      commit('DELETE_OBJECT', payload)
    },
    setRecentMenus ({ commit, state }, payload) {
      let menus = state.recentMenus
      const newRecent = {
        meta: payload.meta,
        path: payload.path,
      }
      const index = R.findIndex(R.propEq('path', newRecent.path))(menus)
      if (index !== -1) {
        menus = R.remove(index, 1, menus)
      }
      menus = R.prepend(newRecent, menus)
      if (menus.length > 8) {
        menus = R.slice(0, 8, menus)
      }
      storage.set(storageRecentMenusKey, menus)
      commit('SET_RECENT_MENUS', menus)
    },
    async queryIsShowSystemResource ({ commit, state }, payload) {
      try {
        const res = await http.get('/v1/parameters/show-system-resource')
        const val = (res.data && res.data.value)
        await commit('SET_IS_SHOW_SYSTEM_RESOURCE', val)
        return res.data
      } catch (error) {
        throw error
      }
    },
    async createIsShowSystemResource ({ commit }, payload) {
      try {
        const res = await http.post('/v1/parameters/show-system-resource', payload)
        const val = (res.data && res.data.value)
        await commit('SET_IS_SHOW_SYSTEM_RESOURCE', val)
        return Promise.resolve(val)
      } catch (error) {
        throw error
      }
    },
    async setIsShowSystemResource ({ state, commit, dispatch }, payload = {}) {
      try {
        const { id, ...rest } = payload
        if (id) {
          const res = await http.put(`/v1/parameters/${id}`, rest)
          const val = (res.data && res.data.value)
          await commit('SET_IS_SHOW_SYSTEM_RESOURCE', val)
          return Promise.resolve(val)
        } else {
          return dispatch('createIsShowSystemResource', {
            name: 'show-system-resource',
            value: payload,
          })
        }
      } catch (err) {
        throw err
      }
    },
  },
}
