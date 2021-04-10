import Vue from 'vue'

export default {
  state: {
    windows: {},
  },
  mutations: {
    CREATE (state, payload) {
      Vue.set(state.windows, payload.id, payload)
    },
    UPDATE (state, payload) {
      const keys = Object.keys(payload)
      for (let i = 0, len = keys.length; i < len; i++) {
        if (keys[i] !== 'id') {
          Vue.set(state.windows[payload.id], keys[i], payload[keys[i]])
        }
      }
    },
    DESTROY (state, id) {
      delete state.windows[id]
    },
  },
  actions: {
    create ({ commit }, payload) {
      commit('CREATE', payload)
    },
    update ({ commit }, payload) {
      commit('UPDATE', payload)
    },
    destroy ({ commit }, id) {
      commit('DESTROY', id)
    },
  },
}
