import http from '@/utils/http'
import { getToken, decodeToken } from '@/utils/auth'
import { SCOPES_MAP } from '@/constants'

export default {
  state: {
    token: getToken(),
    auth: decodeToken(getToken()) || {},
    info: {
      projectId: '',
      projects: [],
    },
    inputUsername: '',
  },
  mutations: {
    SET_TOKEN (state, payload) {
      state.token = payload
    },
    SET_INFO (state, payload) {
      state.info = payload
    },
    SET_AUTH (state, payload) {
      state.auth = payload
    },
    SET_INPUT_USERNAME (state, payload) {
      state.inputUsername = payload
    },
  },
  getters: {
    scope (state) {
      let scope = 'project'
      if (state.info.projectName === SCOPES_MAP.system.key) {
        scope = 'system'
      }
      return scope
    },
    // 是否切换到管理后台
    isAdmin (state, getters) {
      return getters.scope === SCOPES_MAP.system.value
    },
    // 是否切换到域管理后台
    isDomain (state, getters) {
      return getters.scope === SCOPES_MAP.domain.value
    },
    // 当前用户是否有含有 system 权限 项目
    isSystemAdmin (state) {
      return state.info.projects.some(item => item.id === state.info.projectId && item.system_capable)
    },
    // 当前用户是否有含有 domain 权限 项目
    isDomainAdmin (state) {
      return state.info.projects.some(item => item.id === state.info.projectId && item.domain_capable)
    },
    // 是否在管理后台视图下
    isAdminMode (state, getters) {
      return getters.isAdmin && getters.isSystemAdmin
    },
    // 是否在域管理后台视图下
    isDomainMode (state, getters) {
      return getters.isDomain && getters.isDomainAdmin
    },
    l3PermissionEnable (state) {
      return state.info.non_default_domain_projects
    },
  },
  actions: {
    login ({ commit }, payload) {
      return new Promise((resolve, reject) => {
        http.post('/v1/auth/login', {
          ...payload,
        }).then((res) => {
          const token = getToken()
          const auth = decodeToken(token)
          commit('SET_TOKEN', token)
          commit('SET_AUTH', auth)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    getInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        http.get('/v1/auth/user').then(response => {
          const { data: { data } } = response
          if (!data) {
            reject(new Error('Verification failed, please Login again.'))
          }
          commit('SET_INFO', data)
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    validPasscode ({ commit }, data) {
      return new Promise((resolve, reject) => {
        http.post('/v1/auth/passcode', data).then(response => {
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    getRecovery ({ commit }, params) {
      return new Promise((resolve, reject) => {
        http.get('/v1/auth/recovery', { params }).then(response => {
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    setRecovery ({ commit }, data) {
      return new Promise((resolve, reject) => {
        http.post('/v1/auth/recovery', data).then(response => {
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    credential ({ commit }, data) {
      return new Promise((resolve, reject) => {
        http.post('/v1/auth/credential', data).then(response => {
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    setInputUsername ({ commit }, username) {
      commit('SET_INPUT_USERNAME', username)
    },
  },
}
