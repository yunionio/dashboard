import Vue from 'vue'
import { WIDGET_SETTINGS } from '@/constants'
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
     * @description 创建 widgetSettings
     */
    async createFetchWidgetSetting ({ commit }, payload = {}) {
      try {
        const { data } = await http.post('/v1/parameters', payload)
        commit('UPDATE', data)
        return Promise.resolve(data)
      } catch (err) {
        throw err
      }
    },
    /**
     * @description 获取 widgetSettings
     */
    async getFetchWidgetSetting ({ state, commit, dispatch }, payload = {}) {
      try {
        const { data } = await http.get(`/v1/rpc/parameters/${WIDGET_SETTINGS}`)
        commit('UPDATE', data)
        return Promise.resolve(data)
      } catch (err) {
        console.log(err)
      }
    },
    /**
     * @description 更新 widgetSettings
     */
    async putFetchWidgetSettingValue ({ state, commit, dispatch }, payload = {}) {
      try {
        const { data: resData } = await http.get(`/v1/rpc/parameters/${WIDGET_SETTINGS}`)

        if (resData && resData.id) {
          const stateValue = resData.value ? { ...resData.value } : {}
          const params = {
            service: 'yunionagent',
            value: {
              ...stateValue,
              ...payload,
            },
          }
          const { data } = await http.put(`/v1/parameters/${resData.id}`, params)
          commit('UPDATE', data)
          return Promise.resolve(data)
        } else {
          return dispatch('createFetchWidgetSetting', {
            service: 'yunionagent',
            name: WIDGET_SETTINGS,
            value: payload,
          })
        }
      } catch (err) {
        throw err
      }
    },
  },
}
