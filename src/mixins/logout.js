import { mapState } from 'vuex'
import store from '@/store'
import router from '@/router'
import { genReferRouteQuery } from '@/utils/utils'
import { decodeToken } from '@/utils/auth'
export default {
  data () {
    return {
      isTimerOpen: false,
      timer: null,
      timeout: null,
      lastActionTime: 0,
    }
  },
  computed: {
    ...mapState(['auth', 'common']),
  },
  watch: {
    'auth.token': {
      handler (val) {
        if (val && this.auth.noActionLogoutSeconds) {
          this.initInterval()
        } else {
          if (this.timer) {
            clearInterval(this.timer)
          }
        }
        if (val) {
          this.initTimeout(val)
        } else {
          if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = null
          }
        }
      },
      immediate: true,
    },
    'auth.noActionLogoutSeconds': {
      handler (val) {
        if (val && this.auth.token) {
          this.initInterval()
        } else {
          if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    // token过期检测
    initTimeout (token) {
      if (this.timeout) {
        try {
          clearTimeout(this.timeout)
          this.timeout = null
        } catch (err) { }
      }
      const tokenObj = decodeToken(token)
      if (!tokenObj) return
      const { exp } = tokenObj
      if (exp) {
        const time = new Date(exp).getTime() - new Date().getTime()
        if (time > 0 && time < 3 * 24 * 60 * 60 * 1000) {
          this.timeout = setTimeout(() => {
            this.createDialog('LoginDialog', {
              tokenExpTime: exp,
            })
            clearTimeout(this.timeout)
            this.timeout = null
          }, time - 3 * 60 * 1000 < 0 ? 0 : time - 3 * 60 * 1000)
        }
      }
    },
    // 无操作退出
    initInterval () {
      if (this.timer) {
        try {
          clearInterval(this.timer)
          this.timer = null
        } catch (err) { }
      }
      const { noActionLogoutSeconds } = this.auth
      if (!noActionLogoutSeconds) return
      this.timer = setInterval(() => {
        if (this.lastActionTime) {
          if ((new Date().getTime() - this.lastActionTime > noActionLogoutSeconds * 1000)) {
            clearInterval(this.timer)
            this.timer = null
            this.logout()
          }
        } else {
          this.lastActionTime = new Date().getTime()
        }
      }, 1000)
    },
    handleAppAction (e) {
      this.lastActionTime = new Date().getTime()
      this.$bus.$emit('app-action', e)
    },
    logout () {
      store.dispatch('auth/logout').then(() => {
        if (!router.currentRoute.meta.authPage) {
          router.push({
            path: '/auth/login',
            query: genReferRouteQuery(router.currentRoute),
          })
          // 登出后将记录检测时间的config置空，便于重新登录后重新获取新的config
          store.commit('common/SET_GLOBAL_CONFIG', {})
        }
      })
    },
  },
}
