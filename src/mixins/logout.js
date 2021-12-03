import { mapState } from 'vuex'
import store from '@/store'
import router from '@/router'
import { genReferRouteQuery } from '@/utils/utils'
export default {
  data () {
    return {
      isTimerOpen: false,
      timer: null,
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
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
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
    handleAppAction () {
      this.lastActionTime = new Date().getTime()
    },
    logout () {
      store.dispatch('auth/logout').then(() => {
        if (!router.currentRoute.meta.authPage) {
          router.push({
            path: '/auth/login',
            query: genReferRouteQuery(router.currentRoute),
          })
        }
      })
    },
  },
}
