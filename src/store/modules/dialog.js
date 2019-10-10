import Vue from 'vue'

export default {
  state: {
    dialogIds: [],
    dialogs: {},
  },
  mutations: {
    CREATE (state, payload) {
      Vue.set(state.dialogs, payload.id, payload)
      state.dialogIds.push(payload.id)
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
      const index = state.dialogIds.indexOf(id)
      if (index <= -1) return
      state.dialogIds.splice(index, 1)
      Vue.delete(state.dialogs, id)
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
  },
}
