// import { message } from 'ant-design-vue'
import * as R from 'ramda'
import Vue from 'vue'
import ERROR_INFO, { DETAIL_ERRMSG } from '@/constants/error'
import i18n from '@/locales'
import store from '@/store'
import windowsMixin from '@/mixins/windows'
import { hasPermission } from '@/utils/auth'

const WindowVue = Vue.extend({
  mixins: [windowsMixin],
})

// 后端正常响应会携带的链路追踪头，缺失则多为代理/WAF 等非后端错误页
const BACKEND_TRACE_HEADERS = ['x-request-id', 'x-request-host-id']

export const hasBackendTraceHeaders = (headers = {}) => {
  if (!headers || typeof headers !== 'object') return false
  const normalized = {}
  Object.keys(headers).forEach(key => {
    normalized[key.toLowerCase()] = headers[key]
  })
  return BACKEND_TRACE_HEADERS.every(name => {
    const val = normalized[name]
    return val !== undefined && val !== null && String(val).trim() !== ''
  })
}

export const isNonBackendHttpError = (error) => {
  const status = error?.response?.status
  if (!status || status < 400 || status >= 600) return false
  return !hasBackendTraceHeaders(error.response.headers)
}

export const getProxyWafInterceptHint = () => i18n.t('common.message.error.proxy_waf_intercept')

/** 错误详情弹窗「错误源信息」展示格式化，避免字符串被展开为 {0:'P',1:'r',...} */
export const formatErrorResourceForDisplay = (resource) => {
  if (resource == null || resource === '') return ''
  if (R.is(String, resource)) return resource
  if (typeof resource === 'object') {
    try {
      return JSON.stringify(resource, null, 2)
    } catch (e) {
      return String(resource)
    }
  }
  return String(resource)
}

const normalizeErrorResponseResource = (response) => {
  if (!response) return null
  const { status, statusText, headers, data } = response
  if (R.is(String, data)) {
    return {
      status,
      statusText,
      body: data,
      headers,
    }
  }
  if (data != null && typeof data === 'object') {
    return data
  }
  return {
    status,
    statusText,
    body: data != null ? `${data}` : '',
    headers,
  }
}

/** 在已有业务错误信息基础上，追加代理/WAF 补充提示 */
const attachProxyWafHintSupplement = (errorMsg, err) => {
  if (!errorMsg || !isNonBackendHttpError(err)) return errorMsg
  const hint = getProxyWafInterceptHint()
  const detail = errorMsg.detail || ''
  return {
    ...errorMsg,
    proxyWafHint: hint,
    detail,
    detailWithProxyHint: detail ? `${detail}\n\n${hint}` : hint,
  }
}

/** 无其它可展示错误时，仅以代理/WAF 提示兜底 */
export const buildFallbackHttpErrorMessage = (err) => {
  const hint = getProxyWafInterceptHint()
  const status = err?.response?.status
  return {
    class: status ? `HTTP ${status}` : i18n.t('common.message.error.request_failed'),
    detail: '',
    proxyWafHint: hint,
    detailWithProxyHint: hint,
    resource: normalizeErrorResponseResource(err?.response),
  }
}

/**
 * 统一解析 HTTP 错误展示内容：先解析常规后端错误，再处理代理/WAF
 * - 有常规错误 + 非后端响应 → 常规错误 + 补充提示
 * - 无常规错误 + 非后端响应 → 仅代理/WAF 兜底提示
 */
export const resolveHttpErrorDisplay = (err) => {
  const errorMsg = getHttpErrorMessage(err)
  if (errorMsg) {
    return isNonBackendHttpError(err) ? attachProxyWafHintSupplement(errorMsg, err) : errorMsg
  }
  if (isNonBackendHttpError(err)) {
    return buildFallbackHttpErrorMessage(err)
  }
  return null
}

const getDetailInfo = (data) => {
  const details = data.split(':') || []
  if (data.includes('TooManyFailedAttempts')) {
    return DETAIL_ERRMSG.TooManyFailedAttempts
  } else if (data.includes('wrong captcha length')) {
    return DETAIL_ERRMSG.WrongCaptchaLength
  } else if (data.includes('The IDP of user has been disabled or in invalid status')) {
    return DETAIL_ERRMSG.InvalidIdpStatus
  }
  return DETAIL_ERRMSG[details[0]] || data
}

export const getErrorBody = data => {
  if (R.is(String, data)) {
    try {
      return JSON.parse(data)
    } catch (err) {
      return { code: 500, details: data }
    }
  }
  if (!data.code || !data.details) {
    return { code: 500, details: `${data}` }
  }
  return data
}

// const replaceErrorMessage = (obj, arr) => {
//   const { message = '', fields = [] } = obj
//   return message.replace(/\{(\w+)\}/g, (all, $1) => {
//     if (fields[arr[$1]]) {
//       return fields[arr[$1]]
//     }
//     return arr[$1]
//   })
// }

// 获取http请求报错信息（仅解析后端/业务错误，不含代理/WAF 兜底逻辑）
export const getHttpErrorMessage = (err, isErrorBody = false) => {
  if (!isErrorBody && !err.response) return
  if (!isErrorBody && !err.response.data) {
    return
  }
  const errorData = isErrorBody ? err : err.response.data
  let errorBody = getErrorBody(errorData)
  if (R.is(Object, errorBody.error)) errorBody = errorBody.error
  const status = isErrorBody ? err.code : (err.response && err.response.status)
  if (!isErrorBody) {
    const method = err.config.method
    if (status === 502 && method !== 'get') { // 网关错误需要手动添加 class
      errorBody = { ...errorBody, class: 'BadGatewayError' }
    }
  }
  if (!errorBody.class) {
    // 如果为499则前端生成一个临时class
    if (status === 499) {
      errorBody = { ...errorBody, class: 'Other' }
    } else {
      return
    }
  }
  // 默认为错误的元信息
  const ret = getDetailInfo(errorBody.details)
  // 查到对应的class翻译信息
  const errorClass = ERROR_INFO[errorBody.class]
  // if (errorClass) {
  // if (errorBody.data) {
  //   const { id = '', fields = [] } = errorBody.data
  //   // 查到对应class的details翻译信息
  //   const errorInfoDetails = errorInfo.details || {}
  //   const detail = errorInfoDetails[id]
  //   if (detail) {
  //     ret = `${replaceErrorMessage(detail['zh-CN'], fields)}`
  //   }
  // }
  // }
  return {
    // class: errorInfo ? errorInfo['zh-CN'] : errorBody.class,
    class: errorClass || errorBody.class,
    detail: ret,
    resource: !isErrorBody ? normalizeErrorResponseResource(err.response) : err,
  }
}

// 获取http请求信息
export const getHttpReqMessage = error => {
  const { headers, method, params, data, url } = error.config
  const req = {
    method,
    url,
    headers,
  }
  if (data) req.data = R.is(String, data) ? JSON.parse(data) : data
  if (params) req.params = R.is(String, params) ? JSON.parse(params) : params
  return req
}

// 获取列表删除操作权限
const getDeleteItemLabel = (item) => {
  if (!item) return ''
  const name = String(item.name || '').trim()
  if (name) return name
  return String(item.id || '').trim()
}

const formatDeleteFailReason = (failReason) => {
  if (!failReason) return ''
  const errorMessage = getHttpErrorMessage(failReason, true)
  return errorMessage?.detail || ''
}

export const getDeleteResult = (row, deleteField = 'can_delete', failKey = 'delete_fail_reason') => {
  let validate = true
  let tooltip = null
  const items = R.is(Array, row) ? row : [row]
  if (items.length === 0) {
    return {
      validate: false,
    }
  }
  const blocked = items.filter(item => !item?.[deleteField])
  if (blocked.length > 0) {
    validate = false
    const lines = blocked.map(item => {
      const label = getDeleteItemLabel(item)
      const reason = formatDeleteFailReason(item?.[failKey])
      if (label && reason) return `${label}: ${reason}`
      if (label) return label
      if (reason) return reason
      return ''
    }).filter(line => !!line)
    if (lines.length > 0) {
      tooltip = lines.join('\n')
    } else {
      tooltip = i18n.t('common_604')
    }
  }
  return {
    validate,
    tooltip,
  }
}

function isResourceOwner (row, resource) {
  if (resource === 'keypairs' || resource === 'keypair') {
    const userId = store.getters.userInfo.id
    if (row.owner_id && row.owner_id === userId) {
      return true
    }
  }

  return false
}

// 获取列表跨域权限
export const isOwner = (row, resource = '') => {
  const dataArr = R.is(Array, row) ? row : [row]
  const ret = { validate: true, tooltip: '' }
  if (store.getters.isAdminMode) return ret

  let is_owner = false
  if (store.getters.isDomainMode) {
    const projectDomainId = store.getters.userInfo.projectDomainId
    is_owner = dataArr.every(item => (item.domain_id === projectDomainId || isResourceOwner(row, resource)))
  } else {
    const projectId = store.getters.userInfo.projectId
    is_owner = dataArr.every(item => (item.tenant_id === projectId || isResourceOwner(row, resource)))
  }

  if (!is_owner) {
    ret.validate = false
    ret.tooltip = i18n.t('common_716')
  }
  return ret
}

// 获取批量操作的错误信息
export const getBatchErrorMessage = (response, idKey = 'id') => {
  let hasError = false
  const errorsObj = {}
  const errorsArr = []
  const errorData = response.data.data.filter(val => val.status !== 200)
  for (let i = 0, len = errorData.length; i < len; i++) {
    const data = errorData[i]
    const body = getErrorBody(data.data)
    const errorBody = body.error || body
    const obj = {
      ...getHttpErrorMessage(errorBody, true),
      id: data[idKey],
    }
    errorsObj[data[idKey]] = obj
    errorsArr.push(obj)
    hasError = true
  }
  if (hasError) {
    return { errorsObj, errorsArr }
  }
  return { errorsObj: undefined, errorsArr: undefined }
}

export const getDescription = (errorMsg, h) => {
  if (R.is(Array, errorMsg)) { // 批量报错的话直接返回第一个class
    const first = errorMsg[0]
    if (first?.proxyWafHint) {
      return (
        <div>
          <div>{ first.class }</div>
          <div class="mt-2" style="color: #fa8c16;">{ first.proxyWafHint }</div>
        </div>
      )
    }
    return <div>{ first.class }</div>
  }
  if (errorMsg.proxyWafHint) {
    const vnode = classDriver(errorMsg, h)
    return (
      <div>
        <div>{ vnode }</div>
        <div class="mt-2" style="color: #fa8c16;">{ errorMsg.proxyWafHint }</div>
      </div>
    )
  }
  return classDriver(errorMsg, h)
}

const classDriver = (errorMsg, h) => {
  const className = errorMsg.class
  let desc = R.is(Array, errorMsg) ? errorMsg[0].class : errorMsg.detail
  const descSegs = desc.split(':')
  if (descSegs && descSegs.length > 0) {
    desc = descSegs[descSegs.length - 1].trim()
    if (desc === errorMsg.class && descSegs.length > 1) {
      desc = descSegs[descSegs.length - 2].trim()
    }
  }
  const Maps = {
    OutOfQuotaError: () => { // 配额报错
      const quotaErrorsMap = {}
      if (desc.includes('[system.')) {
        quotaErrorsMap.system = { label: i18n.t('common.system.no_quota') }
      }
      if (desc.includes('[domain.')) {
        quotaErrorsMap.domain = { label: i18n.t('common.domain.no_quota'), path: '/domain', tab: 'quota', sidePageName: 'DomainSidePage', resource: 'domains' }
      }
      if (desc.includes('[project.')) {
        quotaErrorsMap.project = { label: i18n.t('common.project.no_quota'), path: '/project', tab: 'quota', sidePageName: 'ProjectSidePage', resource: 'projects' }
      }
      const { detail } = errorMsg
      if (!detail) return desc
      let domainId = null
      let tenantId = null
      if (detail.includes('domain_id')) {
        const domainReg = /^.*domain_id=(\w+).*$/g
        const ret = domainReg.exec(detail)
        if (ret && ret.length) domainId = ret[1]
      }
      if (detail.includes('tenant_id')) {
        const tenantReg = /^.*tenant_id=(\w+).*$/g
        const ret = tenantReg.exec(detail)
        if (ret && ret.length) tenantId = ret[1]
      }
      if (domainId && quotaErrorsMap.domain && hasPermission({ key: 'domains_get' })) quotaErrorsMap.domain.id = domainId
      if (tenantId && quotaErrorsMap.project && hasPermission({ key: 'projects_get' })) quotaErrorsMap.project.id = tenantId
      const vm = new WindowVue({ store })
      const handleOpenSidepage = (item) => {
        vm.sidePageTriggerHandle(vm, item.sidePageName, {
          id: item.id,
          resource: item.resource,
          apiVersion: 'v1',
        }, {
          tab: item.tab,
        })
      }
      const quotaErrors = Object.values(quotaErrorsMap)
      return (
        <div>
          {
            quotaErrors.length ? quotaErrors.map(item => {
              let vnode = item.label
              if (item.sidePageName && item.id && item.resource) {
                vnode = <div class="mt-1"><side-page-trigger onTrigger={ () => handleOpenSidepage(item) } noStore>{item.label}</side-page-trigger></div>
              }
              return vnode
            }) : desc
          }
        </div>
      )
    },
    TooManyRequests: () => {
      return null
    },
  }
  if (Maps[className]) return Maps[className]() // 采用策略模式，命中则执行对应的driver
  return desc
}
