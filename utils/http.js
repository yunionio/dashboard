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
import { getHttpErrorMessage, getHttpReqMessage, getErrorBody } from '@/utils/error'
import { uuid, genReferRouteQuery } from '@/utils/utils'
import { SHOW_SYSTEM_RESOURCE } from '@/constants'
import i18n from '@/locales'

const http = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
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
    hiddenLoadingMessage = message.loading(i18n.t('common.text00122'), 0)
  }, 1500)
}

// 统一处理重复请求，进行cancel
const requestMap = {}
export const getRequestKey = config => {
  let ret = `$${config.url}$$${config.method}`
  const t = config.params && config.params.$t
  if (t) {
    ret += `$$${t}`
    delete config.params.$t
  }
  // 是否展示系统资源控制
  if (store.getters.profile && store.getters.profile.value && store.getters.profile.value[SHOW_SYSTEM_RESOURCE]) {
    if (R.is(Object, config.params)) {
      config.params = { ...config.params, system: true }
    } else {
      config.params = {
        system: true,
      }
    }
  }
  return ret
}
export const cancelRquest = requestKey => {
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
  const message = R.is(Array, errorMsg) ? i18n.t('common.text00123') : errorMsg.class
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
  const errorMsgList = errorList.map(error => {
    const body = getErrorBody(error.data)
    const errorBody = body.error || body
    return {
      ...getHttpErrorMessage(errorBody, true),
      id: error.id,
    }
  })
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
    const requestKey = getRequestKey(config)
    cancelRquest(requestKey)
    pendingCount++
    config.method === 'get' && pendingCount === 1 && showLoading()
    // 3.4起不再需要Authorization header
    // if (store.getters.auth.auth && store.getters.auth.auth.session) {
    //   config.headers.Authorization = `Bearer ${store.getters.auth.auth.session}`
    // }
    config.$requestKey = requestKey
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
  },
)

export const needLogout = error => {
  const isAuth = error.config.url.startsWith('/api/v1/auth')
  const details = error.response.data && error.response.data.details
  const isNoToken = details && details.includes('No token in header')
  const noTotp = details && details.includes('TOTP authentication failed')
  return isAuth || isNoToken || noTotp
}

/**
 * @param {Object} res axios 请求的直接返回值，例如主机创建部分的处理
 * @description 判断请求是否成功，包括批量
 */
export const isSuccess = res => {
  const { data, status } = res
  if (status === 200) return true
  if (status === 207) {
    if (data.data.every(val => val.status === 200)) {
      return true
    }
  }
  return false
}

// response interceptor
http.interceptors.response.use(
  (response) => {
    cancelRquest(response.config.$requestKey)
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
          if (!router.currentRoute.meta.authPage) {
            router.push({
              path: '/auth/login',
              query: genReferRouteQuery(router.currentRoute),
            })
          }
        })
      }
      if (error.response.data && !(error.response.data.details || String()).includes('No token in header')) {
        showHttpErrorMessage(error)
      }
    }
    return Promise.reject(error)
  },
)

export default http
