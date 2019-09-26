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
    $scope (state) {
      let scope = 'project'
      if (state.info.projectName === SCOPES_MAP.system.key) {
        scope = 'system'
      }
      return scope
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
