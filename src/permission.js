/**
 * permission
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2018/08/07
 */
import * as R from 'ramda'
import { hasPermission, checkSessionUser, decodeToken } from '@/utils/auth'
import { isCE, isSAAS } from '@/utils/utils'
import router from './router'
import store from './store'

// 获取scope beforeEach
const scopePermission = require.context('../scope', false, /.\/permission.js/)
let scopeBeforeEach
scopePermission.keys().forEach(name => {
  const obj = scopePermission(name)
  scopeBeforeEach = obj.beforeEach
})

const toLogin = (to, from, next) => {
  const query = {
    pathAuth: true,
    path: to.path,
  }
  if (!R.isNil(to.query) && !R.isEmpty(to.query)) {
    query.pathQuery = JSON.stringify(to.query)
  }
  return next({
    path: '/auth/login',
    query,
  })
}

router.beforeEach(async (to, from, next) => {
  const { auth = true } = to.meta
  // 无token情况
  // 是否为需要认证的页面，是则跳转至登录进行认证，否则next
  const token = store.getters.auth?.token
  const hasToken = !!store.getters.auth?.token
  let exp = false
  try {
    if (token) {
      const tk = decodeToken(token)
      if (tk && tk.exp && new Date(tk.exp).getTime() < new Date().getTime()) {
        exp = true
        console.log('token expired')
      }
    }
  } catch (error) {
    throw error
  }
  if (!hasToken || exp) {
    if (auth) {
      return toLogin(to, from, next)
    }
    return next()
  }
  // 有token情况
  // 如果是登录页面，则直接跳转
  // 不需要认证的页面直接next
  if (to.path.includes('/auth/login')) {
    const authInfo = store.getters.auth.auth
    if (
      authInfo.totp_on &&
      authInfo.system_totp_on &&
      !authInfo.totp_verified
    ) {
      return next()
    }
    // sso登录携带query的情况
    const { rf, pathAuthPage, pathAuth, path, pathQuery } = to.query
    if (rf) {
      document.location.href = rf
      return
    }
    if (!pathAuthPage && pathAuth && path) {
      return next({
        path,
        query: pathQuery && JSON.parse(pathQuery),
      })
    }
    return next('/')
  }
  if (!auth) {
    return next()
  }
  // 需要认证页面
  if (!hasToken) {
    return toLogin(to, from, next)
  }
  const hasRoles = !R.isEmpty(store.getters.userInfo.roles) && !R.isNil(store.getters.userInfo.roles)
  const hasPermission = !R.isEmpty(store.getters.permission) && !R.isNil(store.getters.permission)
  const hasScopeResource = !R.isEmpty(store.getters.scopeResource) && !R.isNil(store.getters.scopeResource)
  const hasCapability = !R.isEmpty(store.getters.capability) && !R.isNil(store.getters.capability)
  const hasGlobalSettings = !R.isEmpty(store.state.globalSetting.id) && !R.isNil(store.state.globalSetting.id)
  const hasProfile = !R.isEmpty(store.state.profile.id) && !R.isNil(store.state.profile.id)
  const hasStats = !R.isEmpty(store.getters.stats) && !R.isNil(store.getters.stats)
  const hasScopePolicy = !R.isEmpty(store.getters.scopedPolicy) && !R.isNil(store.getters.scopedPolicy) && !R.isEmpty(store.getters.scopedPolicy.sub_hidden_menus) && !R.isNil(store.getters.scopedPolicy.sub_hidden_menus)
  const hasGlobalConfig = !R.isEmpty(store.state.common.globalConfig) && !R.isNil(store.state.common.globalConfig)
  // const hasGlobalServices = !R.isEmpty(store.state.common.globalServices) && !R.isNil(store.state.common.globalServices)
  const hasMonitorResourceAlerts = !R.isNil(store.state.monitor.monitorResourceAlerts)
  const hasLicense = !isCE() && !R.isEmpty(store.state.app?.license?.compute) && !R.isNil(store.state.app?.license?.compute)

  try {
    !hasRoles && await store.dispatch('auth/getInfo')
    !hasCapability && await store.dispatch('auth/getCapabilities')
    !hasPermission && await store.dispatch('auth/getPermission')
    !hasScopeResource && await store.dispatch('auth/getScopeResource')
    !isCE() && !isSAAS() && !hasLicense && await store.dispatch('app/fetchLicense')
    !hasGlobalSettings && await store.dispatch('globalSetting/getFetchGlobalSetting')
    !hasProfile && await store.dispatch('profile/get')
    !hasStats && await store.dispatch('auth/getStats')
    !hasScopePolicy && await store.dispatch('scopedPolicy/get', {
      category: [
        'sub_hidden_menus',
        'document_configured_callback_address',
        'server_hidden_columns',
        'disk_hidden_columns',
        'snapshot_hidden_columns',
        'eip_hidden_columns',
        'network_hidden_columns',
        'oss_hidden_columns',
        'rds_hidden_columns',
        'redis_hidden_columns',
        'slb_hidden_columns',
        'mongodb_hidden_columns',
        'vpc_hidden_columns',
        'navbar_hidden_items',
        'dashboard_hidden_actions',
        'fee_hidden_items',
        'bill_resource_hidden_columns',
        'vminstance_hidden_menus',
        'vminstance_configured_callback_address',
      ],
    })
    !hasGlobalConfig && await store.dispatch('common/fetchGlobalServices')
    // !hasGlobalServices && await store.dispatch('common/fetchGlobalServices')
    !hasMonitorResourceAlerts && await store.dispatch('monitor/loadMonitorResourceAlerts')
  } catch (error) {
    throw error
  } finally {
    const { canRenderDefaultLayout = true } = to.meta
    if (canRenderDefaultLayout) {
      store.commit('auth/SET_CAN_RENDER_DEFAULT_LAYOUT', true)
    }
    next()
  }
})

scopeBeforeEach && router.beforeEach(scopeBeforeEach)

// 检测权限，无权限导向403
router.beforeEach((to, from, next) => {
  const { meta = {} } = to.matched[0] || {}
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

router.afterEach((to, from) => {
  const isSessionUser = checkSessionUser()
  if (!isSessionUser) {
    store.dispatch('auth/logout')
    router.push({
      path: '/auth/login',
    })
  }
})
