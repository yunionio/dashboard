/**
 * permission
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2018/08/07
 */
import router from './router'
import store from './store'
import { isLogged } from '@/utils/auth'

// 登录相关的路由名称
const loginPageRouteName = [
  'Auth',
  'Login',
  'Register',
  'SecretVerify',
  'BindSecret',
  'SetSecretQuestion',
  'ResetSecretQuestion',
]
// 白名单路由名称，不需要登录认证
const whiteList = loginPageRouteName.concat([
  '404',
  'NotFound',
  'EmailVerification',
])

router.beforeEach(async (to, from, next) => {
  if (process.env.VUE_APP_IS_PRIVATE && to.meta && to.meta.v1) {
    if (process.env.NODE_ENV === 'development') {
      window.location.href = `${process.env.VUE_APP_V1_PERFIX}${to.path}`
    } else {
      window.location.href = `${window.location.origin}${process.env.VUE_APP_V1_PERFIX}${to.path}`
    }
    return
  }
  const hasToken = !!store.getters.auth.token
  if (hasToken) {
    if (loginPageRouteName.includes(to.name)) {
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
      if (hasRoles && hasPermission && hasScopeResource) {
        next()
      } else {
        try {
          !hasRoles && await store.dispatch('auth/getInfo')
          !hasPermission && await store.dispatch('auth/getPermission')
          !hasScopeResource && await store.dispatch('auth/getScopeResource')
          next()
        } catch (error) {
          throw error
        }
      }
    }
  } else {
    if (whiteList.includes(to.name)) {
      next()
    } else {
      next({ name: 'Auth', query: { lastPath: to.path } })
    }
  }
})
