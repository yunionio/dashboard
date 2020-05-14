import NotFoundPage from '@/views/exception/404'
import NoPermission from '@/views/exception/403'
import EmailVerify from '@/views/email-verify'
import NoProject from '@/views/no-project'
import NoProjectStatus from '@/views/no-project/Status'
import Workflow from '@/views/workflow'

export const menusConfig = getModulesRouteConfig()

let routes = [
  ...getScopeRoutes(),
  ...generateRoutesFromMenu(menusConfig),
  {
    name: 'Workflow',
    path: '/workflow',
    component: Workflow,
  },
  {
    path: '/email-verification/id/:id/token/:token',
    name: 'EmailVerification',
    meta: {
      layout: 'full-screen',
    },
    component: EmailVerify,
  },
  { name: 'NoProject', path: '/no-project', component: NoProject, meta: { layout: 'full-screen' } },
  { name: 'NoProjectStatus', path: '/no-project-status', component: NoProjectStatus, meta: { layout: 'full-screen' } },
  { name: '404', path: '/404', component: NotFoundPage, meta: { layout: 'full-screen' } },
  { name: '403', path: '/403', component: NoPermission, meta: { layout: 'full-screen' } },
  { name: 'NotFound', path: '*', component: NotFoundPage, meta: { layout: 'full-screen' } },
]

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
  let ret = []
  const r = isPrivate ? require.context('../../scope', true, /.\/router\/index.js/) : require.context('../../containers', true, /^((?![\\/]node_modules).)*.\/router\/index.js$/)
  r.keys().forEach(dir => {
    ret = ret.concat(r(dir).default)
  })
  ret.sort((a, b) => a.index - b.index)
  for (let i = 0, len = ret.length; i < len; i++) {
    let item = ret[i]
    item.meta.group = i
    if (item.menus) {
      for (let j = 0; j < item.menus.length; j++) {
        let menu = item.menus[j]
        if (menu.submenus) {
          for (let m = 0; m < menu.submenus.length; m++) {
            let subitem = menu.submenus[m]
            subitem.meta.group = i
          }
        } else {
          menu.meta.group = i
        }
      }
    } else {
      item.menu.meta.group = i
    }
  }
  return ret
}

// Menu should have 2 levels.
function generateRoutesFromMenu (menugroups = [], routes = []) {
  for (let m = 0, ml = menugroups.length; m < ml; m++) {
    let mg = menugroups[m]
    if (mg.menu) {
      routes.push(mg.menu)
    }
    if (mg.menus) {
      for (let i = 0, l = mg.menus.length; i < l; i++) {
        let item = mg.menus[i]
        if (item.path) {
          routes.push(item)
        }
        if (item.submenus) {
          // second tier
          for (let j = 0; j < item.submenus.length; j++) {
            let subitem = item.submenus[j]
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

export default routes
