import Vue from 'vue'

export default {
  state: {
    dialogs: {},
  },
  mutations: {
    CREATE (state, payload) {
      Vue.set(state.dialogs, payload.id, payload)
    },
    UPDATE (state, payload) {
      const keys = Object.keys(payload)
      for (let i = 0, len = keys.length; i < len; i++) {
        if (keys[i] !== 'id') {
          Vue.set(state.dialogs[payload.id], keys[i], payload[keys[i]])
        }
      }
    },
    DESTROY (state, id) {
      Vue.delete(state.dialogs, id)
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
