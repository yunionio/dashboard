// import { message } from 'ant-design-vue'
import * as R from 'ramda'
import ERROR_INFO from '@/constants/error'

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

const replaceErrorMessage = (obj, arr) => {
  const { message = '', fields = [] } = obj
  return message.replace(/\{(\w+)\}/g, (all, $1) => {
    if (fields[arr[$1]]) {
      return fields[arr[$1]]
    }
    return arr[$1]
  })
}

// 获取http请求报错信息
export const getHttpErrorMessage = (err, isErrorBody = false) => {
  if (!isErrorBody && (!err.response || !err.response.data)) return
  const errorData = isErrorBody ? err : err.response.data
  const status = err.response.status
  const method = err.config.method
  let errorBody = getErrorBody(errorData)
  if (status === 502 && method !== 'get') { // 网关错误需要手动添加 class
    errorBody = { ...errorBody, class: 'BadGatewayError' }
  }
  if (!errorBody.class) return
  // 默认为错误的元信息
  let ret = errorBody.details
  // 查到对应的class翻译信息
  const errorInfo = ERROR_INFO[errorBody.class]
  if (errorInfo) {
    if (errorBody.data) {
      const { id = '', fields = [] } = errorBody.data
      // 查到对应class的details翻译信息
      const errorInfoDetails = errorInfo['details'] || {}
      const detail = errorInfoDetails[id]
      if (detail) {
        ret = `${replaceErrorMessage(detail['zh-CN'], fields)}`
      }
    }
  }
  return {
    class: errorInfo ? errorInfo['zh-CN'] : errorBody.class,
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
  if (R.is(Array, row)) {
    if (!row.length) return { validate: false }
    validate = row.every(obj => !!obj[deleteField])
  } else {
    validate = !!row[deleteField]
    if (!validate) {
      let deleteFailReason
      if (R.is(String, row[failKey])) {
        try {
          deleteFailReason = JSON.parse(row[failKey])
        } catch (error) {
          console.warn(`${failKey}格式匹配错误`)
        }
      }
      if (deleteFailReason) {
        const error = deleteFailReason.error
        const errorMessage = getHttpErrorMessage(error, true)
        tooltip = `${errorMessage.class}: ${errorMessage.detail}`
      }
    }
  }
  return {
    validate,
    tooltip,
  }
}
