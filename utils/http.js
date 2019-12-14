/**
 * Rquest
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/08/08
 */

import { message, notification } from 'ant-design-vue'
import * as R from 'ramda'
import axios from 'axios'
import qs from 'qs'
import store from '@/store'
import router from '@/router'
import { getHttpErrorMessage, getHttpReqMessage } from '@/utils/error'
import { uuid } from '@/utils/utils'

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
    hiddenLoadingMessage = message.loading('数据加载中，请稍候', 0)
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

const resolveError = error => {
  const errorMsg = getHttpErrorMessage(error)
  if (!errorMsg) throw error
  const reqMsg = getHttpReqMessage(error)
  showErrorNotify({ errorMsg, reqMsg })
}

const showErrorNotify = ({ errorMsg, reqMsg }) => {
  const message = R.is(Array, errorMsg) ? '批量操作错误' : errorMsg.class
  const description = R.is(Array, errorMsg) ? errorMsg[0].class : errorMsg.detail
  const key = `notification-${uuid(32)}`
  notification.error({
    key,
    class: 'error-notification',
    message,
    description,
    icon: h => <a-icon type="info-circle" class="error-color" />,
    btn: h => {
      const id = `ErrorDialog-${uuid(32)}`
      return h('a-button', {
        props: {
          type: 'link',
          size: 'small',
        },
        class: 'error-color',
        on: {
          click: () => {
            notification.close(key)
            store.dispatch('dialog/create', {
              name: 'ErrorDialog',
              parentWindowId: 'ErrorDialogWrapper',
              id,
              params: {
                error: errorMsg,
                request: reqMsg,
              },
            })
          },
        },
      }, '查看详情')
    },
  })
}

const showHttpBatchErrorMessage = response => {
  const errorList = response.data.data.filter(val => val.status !== 200)
  const errorMsgList = errorList.map(errorData => ({ ...getHttpErrorMessage(errorData.data, true), id: errorData.id }))
  if (!errorMsgList || !errorMsgList.length) return
  const reqMsg = getHttpReqMessage(response)
  showErrorNotify({ errorMsg: errorMsgList, reqMsg })
}

const showHttpErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status
    if (error.config) {
      if (status === 404) {
        if (error.config.method.toLowerCase() !== 'get') {
          resolveError(error)
        }
      } else {
        resolveError(error)
      }
    }
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

export const needLogout = error => {
  const isAuth = error.config.url.startsWith('/api/v1/auth')
  const isNoToken = error.response.data && error.response.data.details && error.response.data.details.includes('No token in header')
  return isAuth || isNoToken
}

// response interceptor
http.interceptors.response.use(
  (response) => {
    cancelRquest(response.config['$requestKey'])
    pendingCount--
    pendingCount === 0 && hiddenLoading()
    if (response.status === 207) { // 批量操作
      showHttpBatchErrorMessage(response)
    }
    return response
  },
  (error) => {
    pendingCount--
    pendingCount === 0 && hiddenLoading()
    if (error.response) {
      const status = error.response.status
      if (status === 401 && needLogout(error)) {
        store.dispatch('auth/logout').then(() => {
          router.push('/auth')
        })
      }
      showHttpErrorMessage(error)
    }
    return Promise.reject(error)
  }
)

export default http
