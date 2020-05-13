import * as R from 'ramda'
import moment from 'moment'
import Cookies from 'js-cookie'
import { Base64 } from 'js-base64'
import store from '@/store'
import router from '@/router'
import { typeClouds } from '@/utils/common/hypervisor'
import http from '@/utils/http'
import storage from '@/utils/storage'

const ONECLOUD_AUTH_KEY = 'yunionauth'
export const LAST_LOGIN_USERNAME_KEY = '__LAST_LOGIN_USERNAME__'

export function getToken () {
  return Cookies.get(ONECLOUD_AUTH_KEY)
}

export function setToken (token) {
  return Cookies.set(ONECLOUD_AUTH_KEY, token)
}

export function removeToken () {
  return Cookies.remove(ONECLOUD_AUTH_KEY)
}

export function decodeToken (token) {
  if (token) {
    const auth = Base64.decode(token)
    if (auth) {
      try {
        return JSON.parse(auth)
      } catch (error) {
        router.push('/auth')
        console.warn('Parse auth failed, please re login')
      }
    }
  }
  return null
}

export function isLogged () {
  let token = getToken()
  if (token) {
    const auth = Base64.decode(token)
    if (auth) {
      try {
        const obj = JSON.parse(auth)
        const diff = moment(obj.exp).diff(moment(), 'seconds')
        if (diff > 0) {
          return true
        }
      } catch (error) {
        return false
      }
    }
  }
  return false
}

export function hasPermission ({
  key,
  // 资源数据
  resourceData,
}) {
  // 没有声明定义的权限key，默认认为有权限
  if (!key) return true
  // 支持检验一组定义的权限key，如 'server_list,server_create'
  const keys = key.split(',')
  const has = keys.every(item => {
    // 这里只判断无权限的情况
    // 获取当前的key对应的权限结果
    const pArr = store.getters.permission && store.getters.permission[item]
    if (pArr && pArr.length > 0) {
      // 如果当前的权限的资源不包含此资源直接不显示
      if (!store.getters.currentScopeResource.includes(pArr[1])) return false
      // 权限值 allow, guest, user, deny
      const val = pArr[pArr.length - 1]
      if (val === 'deny') {
        return false
      }
      if (resourceData && !store.getters.isAdminMode && !store.getters.isDomainMode) {
        if (val === 'allow') {
          const action = pArr[2]
          if (resourceData.fingerprint && resourceData.public_key && resourceData.scheme) {
            return true
          }
          if (
            (resourceData.tenant_id && resourceData.tenant_id === store.getters.userInfo.projectId) ||
            (resourceData.is_public && resourceData.is_public === true && action === 'get')
          ) {
            return true
          } else {
            return false
          }
        }
      }
      if (val === 'guest' || val === 'user' || val === 'allow') {
        const isSystemResource = store.getters.scopeResource && store.getters.scopeResource.system.includes(pArr[1])
        const isDomainResource = store.getters.scopeResource && store.getters.scopeResource.domain.includes(pArr[1])
        if (isSystemResource) {
          if (!store.getters.isAdminMode) {
            return false
          }
        }
        if (isDomainResource) {
          if (!store.getters.isDomainMode && !store.getters.isAdminMode) {
            return false
          }
        }
      }
    }
    // 默认有权限
    return true
  })
  return has
}

export function hasServices (services) {
  let s = R.is(String, services) ? [services] : services
  return s.some(item => {
    const r = (store.getters.userInfo.services || []).find(v => v.type === item && v.status === true)
    return !!r
  })
}

export function hasHypervisors (hypervisors) {
  let h = R.is(String, hypervisors) ? [hypervisors] : hypervisors
  return h.some(item => (store.getters.capability.hypervisors || []).includes(item))
}

export function hasBrands (brands) {
  let b = R.is(String, brands) ? [brands] : brands
  return b.some(item => (store.getters.capability.brands || []).includes(item))
}

export function hasHypervisorsByEnv (envs) {
  const envsMap = {
    idc: [],
    private: [],
    public: [],
    baremetal: ['baremetal'],
  }
  R.forEachObjIndexed((val, key) => {
    envsMap[val.env].push(key)
  }, typeClouds.getHypervisor())
  if (R.is(String, envs)) {
    return hasHypervisors(envsMap[envs])
  }
  if (R.is(Array, envs)) {
    return envs.some(t => hasHypervisors(envsMap[t]))
  }
}

export function hasBrandsByEnv (envs) {
  const envsMap = {
    idc: [],
    private: [],
    public: [],
  }
  R.forEachObjIndexed((val, key) => {
    envsMap[val.env].push(key)
  }, typeClouds.getBrand())
  if (R.is(String, envs)) {
    return hasBrands(envsMap[envs])
  }
  if (R.is(Array, envs)) {
    return envs.some(t => hasBrands(envsMap[t]))
  }
}

export function updateLastLoginUserName () {
  return new Promise((resolve, reject) => {
    const lastLoginUserName = storage.get(LAST_LOGIN_USERNAME_KEY)
    http.get('/v1/auth/user').then(res => {
      const data = res.data.data || {}
      if (lastLoginUserName !== data.name) {
        Cookies.remove('tenant')
        Cookies.remove('scope')
      }
      store.commit('auth/SET_INFO', data)
      store.dispatch('auth/getCapabilities')
      storage.set(LAST_LOGIN_USERNAME_KEY, data.name)
      resolve()
    }).catch(() => {
      resolve()
    })
  })
}
