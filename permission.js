/**
 * permission
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2018/08/07
 */
import * as R from 'ramda'
import router from './router'
import store from './store'
import { isLogged, hasPermission } from '@/utils/auth'

// 获取scope beforeEach
const scopePermission = require.context('../scope', false, /.\/permission.js/)
let scopeBeforeEach
scopePermission.keys().forEach(name => {
  const obj = scopePermission(name)
  scopeBeforeEach = obj.beforeEach
})

router.beforeEach(async (to, from, next) => {
  const { authPage = false, auth = true } = to.meta
  const hasToken = !!store.getters.auth.token
  if (hasToken) {
    if (authPage) {
      if (to.name === 'Login') {
        const logged = isLogged()
        if (logged) {
          next('/')
        }
      } else {
        next()
      }
    } else {
      const hasRoles = !!store.getters.userInfo.roles
      const hasPermission = !!store.getters.permission
      const hasScopeResource = !!store.getters.scopeResource
      const hasCapability = !R.isEmpty(store.getters.capability) && !R.isNil(store.getters.capability)
      if (hasRoles && hasPermission && hasScopeResource) {
        next()
      } else {
        try {
          !hasRoles && await store.dispatch('auth/getInfo')
          !hasCapability && await store.dispatch('auth/getCapabilities')
          !hasPermission && await store.dispatch('auth/getPermission')
          !hasScopeResource && await store.dispatch('auth/getScopeResource')
          next()
        } catch (error) {
          throw error
        }
      }
    }
  } else {
    if (!auth) {
      next()
    } else {
      next({ name: 'Auth' })
    }
  }
})

// 检测权限，无权限导向403
router.beforeEach((to, from, next) => {
  const { meta = {} } = to.matched[0]
  if (meta.permission) {
    const isPermission = hasPermission({ key: meta.permission })
    if (!isPermission) return next('/403')
  }
  if (meta.hidden) {
    const isHidden = meta.hidden()
    if (isHidden) return next('/403')
  }
  next()
})

scopeBeforeEach && router.beforeEach(scopeBeforeEach)
