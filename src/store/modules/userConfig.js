import Vue from 'vue'
import http from '@/utils/http'

/**
 * 用户配置
 */
export default {
  state: {
    info: null,
  },
  mutations: {
    UPDATE (state, payload = {}) {
      const { key, value } = payload
      Vue.set(state, key, value)
    },
  },
  actions: {
    /**
     * 查询用户配置
     */
    async queryParametersByKey ({ commit, state }, payload) {
      try {
        const { key } = payload
        const res = await http.get(`/v1/parameters/${key}`)
        await commit('UPDATE', { key: 'info', value: { [key]: res.data } })
        return Promise.resolve(res.data)
      } catch (err) {
        throw err
      }
    },
    /**
     * 创建用户配置
     */
    async createParameters ({ commit }, payload) {
      try {
        const { key, value } = payload
        const res = await http.post('/v1/parameters', { name: key, value })
        await commit('UPDATE', { key: 'info', value: { [key]: res.data } })
        return Promise.resolve(res.data)
      } catch (err) {
        throw err
      }
    },
    /**
     * 更新用户配置
     */
    async updateParameters ({ state, commit, dispatch }, payload = {}) {
      try {
        const { key, value } = payload
        if (state.info && state.info[key]) {
          const res = await http.put(`/v1/parameters/${key}`, { value })
          await commit('UPDATE', { key: 'info', value: { [key]: res.data } })
          return Promise.resolve(res.data)
        } else {
          return dispatch('createParameters', {
            key,
            value,
          })
        }
      } catch (err) {
        throw err
      }
    },
  },
}
