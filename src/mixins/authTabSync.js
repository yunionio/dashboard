import { message } from 'ant-design-vue'
import i18n from '@/locales'
import {
  getTokenFromCookie,
  decodeToken,
  getScopeFromCookie,
  getTenantFromCookie,
} from '@/utils/auth'

export default {
  data () {
    return {
      authTabSyncing: false,
      _authTabHideLoading: null,
      _authTabLoadingTimer: null,
    }
  },
  created () {
    document.addEventListener('visibilitychange', this.syncAuthFromCookie)
  },
  beforeDestroy () {
    document.removeEventListener('visibilitychange', this.syncAuthFromCookie)
    this.closeAuthTabLoading()
  },
  methods: {
    closeAuthTabLoading () {
      if (this._authTabLoadingTimer) {
        clearTimeout(this._authTabLoadingTimer)
        this._authTabLoadingTimer = null
      }
      if (typeof this._authTabHideLoading === 'function') {
        this._authTabHideLoading()
        this._authTabHideLoading = null
      }
    },
    async syncAuthFromCookie () {
      if (document.visibilityState !== 'visible') return

      const auth = this.$store.state.auth.auth || {}
      if (
        this.$route.path.startsWith('/auth') &&
        auth.totp_on &&
        auth.system_totp_on &&
        !auth.totp_verified
      ) {
        return
      }

      const cookieToken = getTokenFromCookie()
      const cookieAuth = cookieToken ? (decodeToken(cookieToken) || {}) : {}
      const cookieUserId = cookieAuth.user_id || ''
      const cookieTenant = getTenantFromCookie() || ''
      const cookieScope = getScopeFromCookie() || 'project'

      const storeToken = this.$store.state.auth.token
      const storeUserId = this.$store.getters.userInfo?.id || ''
      const storeTenant = this.$store.state.auth.tenant || ''
      const storeScope = this.$store.state.auth.scope || 'project'

      const cookieLoggedIn = !!cookieToken
      const storeLoggedIn = !!storeToken

      // 其他 Tab 登出
      if (!cookieLoggedIn && storeLoggedIn) {
        await this.$store.dispatch('auth/logout')
        if (!this.$route.path.startsWith('/auth')) {
          this.$router.push({ path: '/auth/login' })
        }
        return
      }

      // 其他 Tab 登录
      if (cookieLoggedIn && !storeLoggedIn) {
        if (this.authTabSyncing) return
        this.authTabSyncing = true
        this.$store.commit('auth/SET_SCOPE', cookieScope)
        if (cookieTenant) this.$store.commit('auth/SET_TENANT', cookieTenant)
        this.$store.commit('auth/UPDATE_AUTH')
        // 需要登录恢复 → 显示 loading
        this.closeAuthTabLoading() // 防重复，先清旧的
        this._authTabHideLoading = message.loading(i18n.t('common.text00122'), 0)
        this._authTabLoadingTimer = setTimeout(() => {
          this.closeAuthTabLoading()
        }, 5000)
        try {
          await this.$router.replace('/')
          // 已经开始/完成切页 → 立刻关 loading
          this.closeAuthTabLoading()
        } catch (e) {
          // 重复导航等，同样关 loading
          this.closeAuthTabLoading()
        } finally {
          this.authTabSyncing = false
        }
        return
      }

      // 用户 / 项目 / 视图变化
      if (cookieLoggedIn && storeLoggedIn) {
        const userChanged = cookieUserId && storeUserId && cookieUserId !== storeUserId
        const tenantChanged = cookieTenant !== storeTenant
        const scopeChanged = cookieScope !== storeScope
        if (userChanged || tenantChanged || scopeChanged) {
          this.$store.commit('auth/SET_SCOPE', cookieScope)
          if (cookieTenant) this.$store.commit('auth/SET_TENANT', cookieTenant)
          this.$store.commit('auth/UPDATE_AUTH')
          window.location.reload()
        }
      }
    },
  },
}
