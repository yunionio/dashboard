import Vue from 'vue'
import * as R from 'ramda'
import { GLOBAL_SETTINGS } from '@/constants'
import { fillBillSupportFeatures } from '@/utils/auth'
import c from '@/constants/feature'
import http from '@/utils/http'

function getGroups (items) {
  const groups = c.items.map(i => {
    if (items.indexOf(i.value) >= 0 && i.meta && i.meta.group) {
      return i.meta.group
    }
  }).filter(i => { return i })
  return R.uniq(groups)
}

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
    async getFetchGlobalSetting ({ state, commit, dispatch, rootState }, payload = {}) {
      try {
        const { data } = await http.get('/v1/rpc/parameters/global-settings')
        const licenseFeatures = rootState?.app?.license?.compute?.features || []
        commit('UPDATE', data)
        if (licenseFeatures.length && data.value && data.value.setupKeys) {
          const licenseKeys = fillBillSupportFeatures([...licenseFeatures, ...getGroups(licenseFeatures)], true)
          data.value.setupKeys = data.value.setupKeys.filter(key => {
            return licenseKeys.includes(key)
          })
        }
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
        if (payload.checkExistSetting) {
          await dispatch('getFetchGlobalSetting')
        }
        if (state && state.id) {
          const stateValue = state.value ? { ...state.value } : {}
          const values = { ...payload }
          if (values.setupKeys) {
            const allFeatures = [...(c.items || []).map(item => item.key), ...(c.groups || [])]
            const userDefinedKeys = {}
            allFeatures.map(key => {
              userDefinedKeys[key] = values.setupKeys.includes(key)
            })
            values.userDefinedKeys = userDefinedKeys
          }
          const params = {
            value: {
              ...stateValue,
              ...values,
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
