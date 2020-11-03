import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { needLogout } from '@/utils/http'

const REQUEST_TIMEOUT = 1000 * 60 * 2

const influxdb = axios.create({
  baseURL: '/unifiedmonitors',
  timeout: REQUEST_TIMEOUT,
})

influxdb.interceptors.request.use(config => {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${store.getters.auth.auth.session}`,
    },
  }
}, error => {
  Promise.reject(error)
})

influxdb.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      if (status === 401 && needLogout(error)) {
        store.dispatch('auth/logout').then(() => {
          router.push('/auth')
        })
      }
    }
    return Promise.reject(error)
  },
)

export default influxdb
