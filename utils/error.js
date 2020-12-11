// import { message } from 'ant-design-vue'
import * as R from 'ramda'
import Vue from 'vue'
// import ERROR_INFO from '@/constants/error'
import i18n from '@/locales'
import store from '@/store'
import windowsMixin from '@/mixins/windows'

const WindowVue = Vue.extend({
  mixins: [windowsMixin],
})

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

// 获取http请求报错信息
export const getHttpErrorMessage = (err, isErrorBody = false) => {
  if (!isErrorBody && (!err.response || !err.response.data)) return
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
  const ret = errorBody.details
  // 查到对应的class翻译信息
  // const errorInfo = ERROR_INFO[errorBody.class]
  // if (errorInfo) {
  //   if (errorBody.data) {
  //     const { id = '', fields = [] } = errorBody.data
  //     // 查到对应class的details翻译信息
  //     const errorInfoDetails = errorInfo.details || {}
  //     const detail = errorInfoDetails[id]
  //     if (detail) {
  //       ret = `${replaceErrorMessage(detail['zh-CN'], fields)}`
  //     }
  //   }
  // }
  return {
    // class: errorInfo ? errorInfo['zh-CN'] : errorBody.class,
    class: errorBody.class,
    detail: ret,
    resource: !isErrorBody ? err.response.data : err,
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
export const getDeleteResult = (row, deleteField = 'can_delete', failKey = 'delete_fail_reason') => {
  let validate = true
  let tooltip = null
  let data = R.is(Array, row) ? row : [row]
  if (data.length === 0) {
    return {
      validate: false,
    }
  }
  data = data.filter(item => !item[deleteField])
  const len = data.length
  if (len > 0) {
    validate = false
    let deleteFailReason = []
    // 只有一项不可删除条目时
    if (len === 1) {
      deleteFailReason = [data[0][failKey]]
    }
    // 有多条不可删除条目时
    if (len > 1) {
      deleteFailReason = data.map(item => item[failKey]).filter(val => !!val)
    }
    // 处理获取到的 deleteFailReason
    if (deleteFailReason.length > 1 || deleteFailReason.length <= 0) {
      tooltip = i18n.t('common_604')
    } else {
      deleteFailReason = deleteFailReason[0]
      if (deleteFailReason) {
        const error = deleteFailReason
        const errorMessage = getHttpErrorMessage(error, true)
        tooltip = errorMessage.detail
      }
    }
  }
  return {
    validate,
    tooltip,
  }
}

// 获取列表跨域权限
export const isOwner = (row) => {
  const projectDomainId = store.getters.userInfo.projectDomainId
  const projectId = store.getters.userInfo.projectId
  const dataArr = R.is(Array, row) ? row : [row]
  const ret = { validate: true, tooltip: '' }
  if (store.getters.isAdminMode) return ret
  if (store.getters.isDomainMode) {
    const isAllSameDomain = dataArr.every(item => item.domain_id === projectDomainId)
    if (!isAllSameDomain) {
      ret.validate = false
      ret.tooltip = i18n.t('common_716')
    }
  } else {
    const isAllSameProject = dataArr.every(item => item.tenant_id === projectId)
    if (!isAllSameProject) {
      ret.validate = false
      ret.tooltip = i18n.t('common_716')
    }
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
    return <div>{ errorMsg[0].class }</div>
  }
  const vnode = classDriver(errorMsg, h)
  return vnode
}

const classDriver = (errorMsg, h) => {
  const className = errorMsg.class
  const desc = R.is(Array, errorMsg) ? errorMsg[0].class : errorMsg.detail
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
      const domainTenantReg = /^.*domain_id=(\w+?),tenant_id=(\w+?): .*$/g
      const [, domainId, tenantId] = domainTenantReg.exec(detail)
      if (domainId && quotaErrorsMap.domain) quotaErrorsMap.domain.id = domainId
      if (tenantId && quotaErrorsMap.project) quotaErrorsMap.project.id = tenantId
      const vm = new WindowVue({ store })
      const handleOpenSidepage = (item) => {
        if (!item.sidePageName || !item.id || !item.resource) return
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
              return <div class="mt-1"><side-page-trigger onTrigger={ () => handleOpenSidepage(item) } noStore>{item.label}</side-page-trigger></div>
            }) : desc
          }
        </div>
      )
    },
  }
  if (Maps[className]) return Maps[className]() // 采用策略模式，命中则执行对应的driver
  return desc
}
