import AuthLayout from '@/layouts/Auth'
import Login from '@/views/auth/Login'
import Register from '@/views/auth/Register'
import SecretVerify from '@/views/auth/SecretVerify'
import BindSecret from '@/views/auth/BindSecret'
import SetSecretQuestion from '@/views/auth/SetSecretQuestion'
import ResetSecretQuestion from '@/views/auth/ResetSecretQuestion'
import NotFoundPage from '@/views/exception/404'

let routes = [
  { name: 'Home', path: '/', redirect: '/vminstance' },
  {
    name: 'Auth',
    path: '/auth',
    component: AuthLayout,
    redirect: '/auth/login',
    children: [
      {
        name: 'Login',
        path: 'login',
        component: Login,
        meta: { layout: 'full-screen' },
      },
      {
        name: 'Register',
        path: 'register',
        component: Register,
        meta: { layout: 'full-screen' },
      },
      {
        name: 'SecretVerify',
        path: 'secretverify',
        component: SecretVerify,
        meta: { layout: 'full-screen' },
      },
      {
        name: 'BindSecret',
        path: 'bindsecret',
        component: BindSecret,
        meta: { layout: 'full-screen' },
      },
      {
        name: 'SetSecretQuestion',
        path: 'setsecretquestion',
        component: SetSecretQuestion,
        meta: { layout: 'full-screen' },
      },
      {
        name: 'ResetSecretQuestion',
        path: 'resetsecretquestion',
        component: ResetSecretQuestion,
        meta: { layout: 'full-screen' },
      },
    ],
  },
  { name: '404', path: '/404', component: NotFoundPage, meta: { layout: 'full-screen' } },
  { name: 'NotFound', path: '*', component: NotFoundPage, meta: { layout: 'full-screen' } },
]

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

export const menusConfig = getModulesRouteConfig()

if (menusConfig && menusConfig.length > 0) {
  const moduleRoutes = generateRoutesFromMenu(menusConfig)
  routes = routes.concat(moduleRoutes)
}

export default routes
