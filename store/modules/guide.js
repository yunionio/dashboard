export default {
  state: {
    keys: [],
  },
  mutations: {
    UPDATE_KEYS (state, payload) {
      state.keys = payload.keys
    },
  },
  actions: {
    updateKeys ({ commit }, payload) {
      commit('UPDATE_KEYS', payload)
    },
  },
}
