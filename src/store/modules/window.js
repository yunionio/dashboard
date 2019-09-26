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
      Object.keys(payload).forEach(function (propName) {
        if (propName !== 'id') {
          Vue.set(state.windows[payload.id], propName, payload[propName])
        }
      })
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
