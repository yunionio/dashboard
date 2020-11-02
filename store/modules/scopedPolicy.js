import * as R from 'ramda'
import Vue from 'vue'
import http from '@/utils/http'

export default {
  state: {},
  mutations: {
    SET_DATA (state, { name, data }) {
      Vue.set(state, name, data)
    },
    DEL_DATA (state, { name }) {
      Vue.delete(state, name)
    },
  },
  actions: {
    async get ({ commit, rootGetters }, { category, onFinally }) {
      try {
        const categories = R.is(String, category) ? [category] : category
        const response = await http.get('/v1/scopedpolicybindings', {
          params: {
            scope: rootGetters.scope,
            effective: true,
            category: categories,
          },
        })
        const data = response.data.data
        if (data && data.length) {
          for (let i = 0, len = data.length; i < len; i++) {
            const item = data[i]
            commit('SET_DATA', {
              name: item.category,
              data: item.policy,
            })
          }
        }
        // 如果没有请求到相关信息，那么也应该把对应缓存的信息清除掉
        for (let i = 0, len = categories.length; i < len; i++) {
          const item = categories[i]
          const obj = R.find(R.propEq('category', item))(data)
          if (R.isNil(obj)) {
            commit('DEL_DATA', {
              name: item,
            })
          }
        }
        return response
      } finally {
        onFinally && onFinally()
      }
    },
  },
}
