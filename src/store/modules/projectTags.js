// import * as R from 'ramda'
import Vue from 'vue'
import http from '@/utils/http'

export default {
  state: {
    isLoaded: false,
    projectTreeTags: [],
  },
  mutations: {
    SET_DATA (state, { name, data }) {
      Vue.set(state, name, data)
    },
  },
  actions: {
    async updateProjectTreeTags ({ commit }, tags) {
      return http
        .put('/v1/parameters/CONFIG_project_tags', { value: { projectTreeTags: tags } })
        .then(response => {
          commit('SET_DATA', {
            name: 'projectTreeTags',
            data: response.data.value.projectTreeTags || [],
          })
        })
    },
    async getProjectTreeTags ({ commit }) {
      // eslint-disable-next-line
      return new Promise(async (resolve, reject) => {
        try {
          const response = await http.get('/v1/parameters/CONFIG_project_tags')
          if (response.data && response.data.value) {
            commit('SET_DATA', {
              name: 'projectTreeTags',
              data: response.data.value.projectTreeTags || [],
            })
            resolve(response.data.value.projectTreeTags || [])
          } else {
            reject(response)
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            const { data } = await http.post('/v1/parameters', {
              name: 'CONFIG_project_tags',
              value: { projectTreeTags: [] },
            })
            commit('SET_DATA', {
              name: 'projectTreeTags',
              data: data.value.projectTreeTags,
            })
            resolve(data.value.projectTreeTags)
          } else {
            reject(error)
          }
        } finally {
          commit('SET_DATA', {
            name: 'isLoaded',
            data: true,
          })
          reject(new Error('unknown error'))
        }
      })
    },
  },
}
