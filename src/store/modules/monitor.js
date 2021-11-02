import { Manager } from '@/utils/manager'
import {
  getScopeFromCookie,
} from '@/utils/auth'
export default {
  state: {
    monitorResourceAlerts: null,
  },
  mutations: {
    setMonitorResourceAlerts (state, payload) {
      state.monitorResourceAlerts = payload
    },
  },
  actions: {
    async loadMonitorResourceAlerts ({ commit, state, ...ret }, payload = {}) {
      try {
        const params = {
          show_fail_reason: true,
          details: true,
          alertinng: true,
          send_state: 'ok',
          level: 'fatal',
          scope: getScopeFromCookie() || 'project',
          ...payload,
        }
        const { data: { data = [] } } = await new Manager('monitorresourcealerts', 'v1').list({ params })
        commit('setMonitorResourceAlerts', data)
      } catch (error) {
        throw error
      }
    },
  },
}
