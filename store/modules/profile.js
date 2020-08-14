import * as R from 'ramda'
import Vue from 'vue'
import http from '@/utils/http'

const PROFILE_ID = 'profile'

export default {
  state: {
    data: {},
    id: '',
    error: null,
  },
  mutations: {
    SET_DATA (state, { name, data }) {
      Vue.set(state, name, data)
    },
    REST_ID (state) {
      state.id = ''
    },
  },
  actions: {
    async get ({ commit }) {
      try {
        const response = await http.get(`/v1/parameters/${PROFILE_ID}`)
        if (!R.isNil(response.data) && !R.isEmpty(response.data)) {
          commit('SET_DATA', {
            name: 'data',
            data: response.data,
          })
          commit('SET_DATA', {
            name: 'id',
            data: response.data.id,
          })
        }
        return response
      } catch (error) {
        if (error.response && error.response.status === 404) {
          try {
            const response = await http.post('/v1/parameters', {
              name: PROFILE_ID,
              value: {},
            })
            if (!R.isNil(response.data) && !R.isEmpty(response.data)) {
              commit('SET_DATA', {
                name: 'data',
                data: response.data,
              })
            }
            return response
          } catch (error) {
            throw error
          }
        } else {
          throw error
        }
      }
    },
    async update ({ commit, state }, payload) {
      try {
        const newValue = { ...state.data.value, ...payload }
        const response = await http.put(`/v1/parameters/${PROFILE_ID}`, {
          value: newValue,
        })
        if (!R.isNil(response.data) && !R.isEmpty(response.data)) {
          commit('SET_DATA', {
            name: 'data',
            data: response.data,
          })
          commit('SET_DATA', {
            name: 'id',
            data: response.data.id,
          })
        }
        return response
      } catch (error) {
        throw error
      }
    },
  },
}
