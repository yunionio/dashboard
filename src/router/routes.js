import i18n from '@/locales'
import store from '@/store'
import NotFoundPage from '@/views/exception/404'
import NoPermission from '@/views/exception/403'
import EmailVerify from '@/views/email-verify'
import NoProject from '@/views/no-project'
import Clouduser from '@/views/clouduser'
import Icons from '@/components/Icon/Icons'

// menusConfig 需要在 globalSetting 拉取完成后才能准确排序（productVersion 依赖 globalSetting）。
// 这里保持同一个数组引用，通过 splice 原地更新，保证引用 menusConfig 的组件能自动感知变更。
export const menusConfig = []

function refreshMenusConfig () {
  const cfg = getModulesRouteConfig()
  menusConfig.splice(0, menusConfig.length, ...cfg)
}

refreshMenusConfig()

// globalSetting 更新后刷新排序（只影响菜单顺序，不影响已注册的 vue-router routes）
// 注意：此文件会在应用启动早期被加载，可能遇到循环依赖导致 store 尚未就绪，因此需要延迟注册订阅。
let __menusConfigSubscribed = false
function ensureMenusConfigSubscribe () {
  if (__menusConfigSubscribed) return
  let s = store
  try {
    // eslint-disable-next-line global-require
    s = s || (require('@/store').default)
  } catch (e) {
    // ignore
  }
  if (s && typeof s.subscribe === 'function') {
    __menusConfigSubscribed = true
    s.subscribe((mutation) => {
      if (mutation && mutation.type === 'globalSetting/UPDATE') {
        refreshMenusConfig()
      }
    })
  } else {
    setTimeout(ensureMenusConfigSubscribe, 0)
  }
}
ensureMenusConfigSubscribe()

const routes = [
  ...getScopeRoutes(),
  ...generateRoutesFromMenu(menusConfig),
  {
    name: 'Clouduser',
    path: '/clouduser',
    component: Clouduser,
    meta: {
      label: i18n.t('scope.cloudid'),
    },
  },
  {
    path: '/email-verification/id/:id/token/:token',
    name: 'EmailVerification',
    meta: {
      layout: 'full-screen',
      auth: false,
    },
    component: EmailVerify,
  },
  { name: 'NoProject', path: '/no-project', component: NoProject, meta: { layout: 'full-screen' } },
  { name: '404', path: '/404', component: NotFoundPage, meta: { layout: 'full-screen', auth: false } },
  { name: '403', path: '/403', component: NoPermission, meta: { layout: 'full-screen', auth: false } },
  { name: 'NotFound', path: '*', component: NotFoundPage, meta: { layout: 'full-screen', auth: false } },
]

if (process.env.VUE_APP_ENABLE_ICON) {
  routes.push({ name: 'Icons', path: '/icons', component: Icons, meta: { layout: 'full-screen', auth: false } })
}

function getScopeRoutes () {
  const r = require.context('../../scope', true, /.\/router\/routes.js/)
  const keys = r.keys()
  let ret = []
  if (keys && keys.length) {
    ret = r(keys[0]).default
  }
  return ret
}

function getModulesRouteConfig () {
  const isPrivate = process.env.VUE_APP_IS_PRIVATE
  const moduleRoute = process.env.VUE_APP_MODULE_ROUTE
  let ret = []
  const r = (isPrivate || moduleRoute) ? require.context('../../scope', true, /.\/router\/index.js/) : require.context('../../containers', true, /^((?![\\/]node_modules).)*.\/router\/index.js$/)
  r.keys().forEach(dir => {
    ret = ret.concat(r(dir).default)
  })
  const isAI = store?.getters?.globalSetting?.value?.productVersion === 'AI'
  // 用“排序权重”调整展示顺序：仅 AI 产品时，把 AI 模块放到 Compute 前面
  ret = ret
    .map((item, order) => {
      const sortIndex = (isAI && item?.meta?.icon === 'menu-ai') ? 19.5 : item.index
      return { ...item, __sortIndex: sortIndex, __order: order }
    })
    .sort((a, b) => (a.__sortIndex - b.__sortIndex) || (a.__order - b.__order))
    .map(({ __sortIndex, __order, ...item }) => item)
  // 容错：部分模块路由可能未提供 meta，避免读取 undefined.meta 导致页面初始化报错
  ret = ret.filter(val => !(val && val.meta && val.meta.undetected))
  for (let i = 0, len = ret.length; i < len; i++) {
    const item = ret[i]
    if (!item.meta) item.meta = {}
    item.meta.group = i
    if (item.menus) {
      for (let j = 0; j < item.menus.length; j++) {
        const menu = item.menus[j]
        if (!menu.meta) menu.meta = {}
        if (menu.submenus) {
          for (let m = 0; m < menu.submenus.length; m++) {
            const subitem = menu.submenus[m]
            if (!subitem.meta) subitem.meta = {}
            subitem.meta.group = i
          }
        } else {
          menu.meta.group = i
        }
      }
    } else {
      if (!item.menu) item.menu = {}
      if (!item.menu.meta) item.menu.meta = {}
      item.menu.meta.group = i
    }
  }
  return ret
}

// Menu should have 2 levels.
function generateRoutesFromMenu (menugroups = [], routes = []) {
  for (let m = 0, ml = menugroups.length; m < ml; m++) {
    const mg = menugroups[m]
    if (mg.menu) {
      routes.push(mg.menu)
    }
    if (mg.menus) {
      for (let i = 0, l = mg.menus.length; i < l; i++) {
        const item = mg.menus[i]
        if (item.path) {
          routes.push(item)
        }
        if (item.submenus) {
          // second tier
          for (let j = 0; j < item.submenus.length; j++) {
            const subitem = item.submenus[j]
            if (subitem.path) {
              routes.push(subitem)
            }
          }
        }
      }
    }
  }
  return routes
}

routes.forEach((item, index) => {
  if (item.children) {
    item.children.forEach((menu) => {
      if (item.meta?.label) {
        if (!menu.meta) {
          menu.meta = { label: item.meta.label }
        }
        if (!menu.meta.label) {
          menu.meta.label = item.meta.label
        }
      }
    })
  }
})

export default routes
