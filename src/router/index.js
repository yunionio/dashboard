/**
 * Root Router
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2018/08/07
 */
import Vue from 'vue'
import * as R from 'ramda'
import Router from 'vue-router'
import { getProductName } from '@/utils/auth'
import routes from './routes'

const originalPush = Router.prototype.push
const originalReplace = Router.prototype.replace
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}
Router.prototype.replace = function replace (location) {
  return originalReplace.call(this, location).catch(err => err)
}

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.afterEach((to, from, next) => {
  const name = getProductName()
  if (to.meta?.label) {
    document.title = `${name}-${R.is(Function, to.meta.label) ? to.meta.label() : to.meta.label}`
  } else {
    document.title = name
  }
})

export default router
