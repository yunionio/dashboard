import * as R from 'ramda'
import _ from 'lodash'
import Cookies from 'js-cookie'
import http from '@/utils/http'
import { getToken, decodeToken } from '@/utils/auth'
import { SCOPES_MAP } from '@/constants'
import { PERMISSION, ALL_RESOURCES } from '@/constants/permission'

export default {
  state: {
    scope: Cookies.get('scope') || 'project',
    token: getToken(),
    auth: decodeToken(getToken()) || {},
    info: {
      projectId: '',
      projects: [],
    },
    permission: null,
    scopeResource: null,
    capability: {},
  },
  mutations: {
    SET_SCOPE (state, payload) {
      state.scope = payload
    },
    SET_TOKEN (state, payload) {
      state.token = payload
    },
    SET_INFO (state, payload) {
      state.info = payload
    },
    SET_CAPABILITY (state, payload) {
      state.capability = payload
    },
    SET_AUTH (state, payload) {
      state.auth = payload
    },
    SET_PERMISSION (state, payload) {
      state.permission = payload
    },
    SET_SCOPERESOURCE (state, payload) {
      state.scopeResource = payload
    },
  },
  getters: {
    // 是否切换到管理后台
    isAdmin (state, getters) {
      return state.scope === SCOPES_MAP.system.key
    },
    // 是否切换到域管理后台
    isDomain (state, getters) {
      return state.scope === SCOPES_MAP.domain.key
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
    // 是否在项目视图下
    isProjectMode (state, getters) {
      return !getters.isAdminMode && !getters.isDomainMode
    },
    l3PermissionEnable (state) {
      return state.info.non_default_domain_projects
    },
    currentScopeResource (state, getters) {
      let ret = [ ...ALL_RESOURCES ]
      const systemResource = state.scopeResource && state.scopeResource.system
      const domainResource = state.scopeResource && state.scopeResource.domain
      // 如果为管理后台返回所有的资源
      if (getters.isAdminMode) {
        return ret
      }
      // 如果为域管理后台返回所有资源减去管理的资源
      if (getters.isDomainMode) {
        _.remove(ret, resource => {
          return systemResource && systemResource.includes(resource)
        })
        return ret
      }
      // 如果为普通后台减去管理资源和域资源
      _.remove(ret, resource => {
        return (
          (systemResource && systemResource.includes(resource)) ||
          (domainResource && domainResource.includes(resource))
        )
      })
      return ret
    },
  },
  actions: {
    login ({ commit, dispatch }, data) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await http.post('/v1/auth/login', data)
          const token = getToken()
          const auth = decodeToken(token)
          await commit('SET_TOKEN', token)
          await commit('SET_AUTH', auth)
          resolve(response)
        } catch (error) {
          reject(error)
        }
      })
    },
    logout ({ commit }, data) {
      return new Promise(async (resolve, reject) => {
        try {
          const logoutResponse = http.post('/v1/auth/logout', data)
          await commit('SET_TOKEN', null)
          await commit('SET_AUTH', {})
          await commit('SET_INFO', {
            projectId: '',
            projects: [],
          })
          await commit('SET_PERMISSION', null)
          resolve(logoutResponse)
        } catch (error) {
          reject(error)
        }
      })
    },
    reLogin ({ commit, dispatch }, projectId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await dispatch('login', { tenantId: projectId })
          resolve(response)
        } catch (error) {
          reject(error)
        }
      })
    },
    getInfo ({ commit, dispatch, state }) {
      return new Promise(async (resolve, reject) => {
        try {
          const { data: { data } } = await http.get('/v1/auth/user')
          if (!data) {
            reject(new Error('Verification failed, please Login again.'))
          }
          await commit('SET_INFO', data)
          await dispatch('getCapabilities')
          Cookies.set('tenant', data.projectId, { expires: 7 })
          Cookies.set('scope', state.scope, { expires: 7 })
          resolve(data)
        } catch (error) {
          reject(error)
        }
      })
    },
    getCapabilities ({ commit, state }) {
      return new Promise(async (resolve, reject) => {
        const params = {}
        if (state.scope === 'system') {
          params.scope = state.scope
        }
        try {
          const response = await http.get('/v2/capabilities', { params })
          const data = (response.data.data && response.data.data[0]) || {}
          await commit('SET_CAPABILITY', data)
          resolve(response)
        } catch (error) {
          reject(error)
        }
      })
    },
    getPermission ({ commit, state }, scope) {
      return new Promise(async (resolve, reject) => {
        const data = R.map(item => [scope || state.scope, ...item], PERMISSION)
        try {
          const permissionResponse = await http.post('/v1/auth/permissions', data)
          await commit('SET_PERMISSION', permissionResponse.data)
          resolve(permissionResponse)
        } catch (error) {
          reject(error)
        }
      })
    },
    getScopeResource ({ commit, getters }, params) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await http.get('/v1/auth/scoped_resources', { params })
          const data = R.map(item => {
            return R.flatten(R.values(item))
          }, response.data)
          await commit('SET_SCOPERESOURCE', data)
          resolve(response)
        } catch (error) {
          reject(error)
        }
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
  },
}
