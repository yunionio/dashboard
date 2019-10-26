/**
 * Root Router
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2018/08/07
 */
import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import routes from './routes'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

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
])

router.beforeEach(async (to, from, next) => {
  if (process.env.VUE_APP_IS_PRIVATE && to.meta && to.meta.v1) {
    window.location.href = `${process.env.VUE_APP_V1_PERFIX}${to.path}`
    return
  }
  const hasToken = !!store.getters.auth.token
  if (hasToken) {
    if (loginPageRouteName.includes(to.name)) {
      next()
    } else {
      const hasRoles = !!store.getters.userInfo.roles
      const hasPermission = !!store.getters.permission
      const hasScopeResource = !!store.getters.scopeResource
      if (hasRoles && hasPermission) {
        next()
      } else {
        try {
          !hasRoles && await store.dispatch('auth/getInfo')
          !hasPermission && await store.dispatch('auth/getPermission')
          !hasScopeResource && await store.dispatch('auth/getScopeResource')
          next()
        } catch (error) {
          await store.dispatch('auth/logout')
          next({ name: 'Auth' })
          throw error
        }
      }
    }
  } else {
    if (whiteList.includes(to.name)) {
      next()
    } else {
      next({ name: 'Auth' })
    }
  }
})

export default router
