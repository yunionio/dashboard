import Vue from 'vue'
import * as R from 'ramda'
import storage from '@/utils/storage'

const storageRecentMenusKey = '__oc_recent_menus__'

export default {
  state: {
    recentMenus: storage.get(storageRecentMenusKey) || [],
    topAlert: {},
    bill: {
      currency: 'CNY',
    },
  },
  mutations: {
    UPDATE_OBJECT (state, { name, data }) {
      if (!state[name]) state[name] = {}
      Vue.set(state, name, { ...state[name], ...data })
    },
    SET_RECENT_MENUS (state, payload) {
      state.recentMenus = payload
    },
    SET_BILL_CURRENCY (state, payload) {
      state.bill.currency = payload
    },
  },
  actions: {
    updateObject ({ commit }, payload) {
      commit('UPDATE_OBJECT', payload)
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
  },
}
