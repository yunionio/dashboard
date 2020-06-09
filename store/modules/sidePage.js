import Vue from 'vue'

export default {
  state: {
    sidePageIds: [],
    sidePages: {},
    sidepageLeft: 0,
  },
  mutations: {
    CREATE (state, payload) {
      Vue.set(state.sidePages, payload.id, payload)
      state.sidePageIds.push(payload.id)
    },
    UPDATE (state, payload) {
      const keys = Object.keys(payload)
      for (let i = 0, len = keys.length; i < len; i++) {
        if (keys[i] !== 'id') {
          Vue.set(state.sidePages[payload.id], keys[i], payload[keys[i]])
        }
      }
    },
    DESTROY (state, id) {
      const index = state.sidePageIds.indexOf(id)
      if (index <= -1) return
      state.sidePageIds.splice(index, 1)
      Vue.delete(state.sidePages, id)
    },
    SET_SIDEPAGE_LEFT (state, payload) {
      state.sidepageLeft = payload
    },
  },
  getters: {
    isSidepageOpen (state) {
      return !!state.sidePageIds.length
    },
  },
  actions: {
    create ({ commit }, payload) {
      return new Promise((resolve, reject) => {
        commit('CREATE', payload)
        resolve(payload.id)
      })
    },
    update ({ commit }, payload) {
      commit('UPDATE', payload)
    },
    destroy ({ commit }, id) {
      commit('DESTROY', id)
    },
    updateSidepageLeft ({ commit }, payload) {
      commit('SET_SIDEPAGE_LEFT', payload)
    },
  },
}
