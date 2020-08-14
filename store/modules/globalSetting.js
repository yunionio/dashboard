import Vue from 'vue'
import { GLOBAL_SETTINGS } from '@/constants'
import http from '@/utils/http'

export default {
  state: {
    value: {},
  },
  mutations: {
    UPDATE (state, payload = {}) {
      for (const key in payload) {
        Vue.set(state, key, payload[key])
      }
    },
  },
  actions: {
    /**
     * @description 创建globalSettings
     */
    async createFetchGlobalSetting ({ commit }, payload = {}) {
      try {
        const { data } = await http.post('/v1/parameters', payload)
        commit('UPDATE', data)
        return Promise.resolve(data)
      } catch (err) {
        throw err
      }
    },
    /**
     * @description 获取globalSettings
     */
    async getFetchGlobalSetting ({ state, commit, dispatch }, payload = {}) {
      try {
        const { data } = await http.get('/v1/rpc/parameters/global-settings')
        commit('UPDATE', data)
        return Promise.resolve(data)
      } catch (err) {
        console.log(err)
      }
    },
    /**
     * @description 更新globalSettings
     */
    async putFetchGlobalSettingValue ({ state, commit, dispatch }, payload = {}) {
      try {
        if (state && state.id) {
          const stateValue = state.value ? { ...state.value } : {}
          const params = {
            value: {
              ...stateValue,
              ...payload,
            },
          }
          const { data } = await http.put(`/v1/parameters/${state.id}`, params)
          commit('UPDATE', data)
          return Promise.resolve(data)
        } else {
          return dispatch('createFetchGlobalSetting', {
            service: 'yunionagent',
            name: GLOBAL_SETTINGS,
            value: payload,
          })
        }
      } catch (err) {
        throw err
      }
    },
  },
}
