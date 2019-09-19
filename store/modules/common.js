import Vue from 'vue'

export default {
  state: {},
  mutations: {
    UPDATE_OBJECT (state, { name, data }) {
      if (!state[name]) state[name] = {}
      Vue.set(state, name, { ...state[name], ...data })
    },
  },
  actions: {
    updateObject ({ commit }, payload) {
      commit('UPDATE_OBJECT', payload)
    },
  },
}
