/**
 * Rquest
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/08/08
 */

import { message } from 'ant-design-vue'
import axios from 'axios'
import qs from 'qs'
import store from '@/store'
import router from '@/router'

const http = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 60000,
})

// 超过1.5s的请求显示正在加载message
let loadingTimer = null
let hiddenLoadingMessage = null
let pendingCount = 0

function hiddenLoading () {
  if (typeof hiddenLoadingMessage === 'function') {
    hiddenLoadingMessage()
  }
  clearTimeout(loadingTimer)
  loadingTimer = null
}

function showLoading () {
  hiddenLoading()
  loadingTimer = setTimeout(() => {
    hiddenLoadingMessage = message.loading('数据加载中，请稍后', 0)
  }, 1500)
}

// 统一处理重复请求，进行cancel
const requestMap = {}
const getRquestKey = config => `$${config.url}$$${config.method}`
const cancelRquest = requestKey => {
  const request = requestMap[requestKey]
  if (request) {
    request.cancel()
    delete requestMap[requestKey]
  }
}

// request interceptor
http.interceptors.request.use(
  (config) => {
    const requestKey = getRquestKey(config)
    cancelRquest(requestKey)
    pendingCount++
    config.method === 'get' && pendingCount === 1 && showLoading()
    if (store.getters.auth.auth && store.getters.auth.auth.session) {
      config.headers['Authorization'] = `Bearer ${store.getters.auth.auth.session}`
    }
    config['$requestKey'] = requestKey
    config.cancelToken = new axios.CancelToken(cancel => {
      requestMap[requestKey] = {
        cancel,
      }
    })
    config.paramsSerializer = params => qs.stringify(params, { arrayFormat: 'repeat' })
    return config
  },
  (error) => {
    pendingCount--
    pendingCount === 0 && hiddenLoading()
    Promise.reject(error)
  }
)

// response interceptor
http.interceptors.response.use(
  (response) => {
    cancelRquest(response.config['$requestKey'])
    pendingCount--
    pendingCount === 0 && hiddenLoading()
    return response
  },
  (error) => {
    pendingCount--
    pendingCount === 0 && hiddenLoading()
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        router.push('/auth')
      }
    }
    return Promise.reject(error)
  }
)

export default http
