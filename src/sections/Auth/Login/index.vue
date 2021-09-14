<template>
  <div class="login-index-wrap flex-fill d-flex h-100 align-items-center" v-loading.fullscreen="!regionsLoading">
    <div class="login-index-left d-flex flex-fill align-items-center pr-4" :style="{backgroundImage: loginBg}">
      <div>
        <h2 :style="{ color: getI18nColorVal(companyInfo, 'login_page_slogan') }">{{ getI18nVal(companyInfo, 'login_page_slogan') || $t('login.desc1') }}</h2>
        <h4 :style="{ color: getI18nColorVal(companyInfo, 'login_page_sub_slogan') }">{{ getI18nVal(companyInfo, 'login_page_sub_slogan') || $t('login.desc2') }}</h4>
      </div>
    </div>
    <div class="login-index-right d-flex flex-column shadow-lg bg-white rounded">
      <!-- login form -->
      <div class="flex-fill position-relative">
        <div class="login-content-wrap h-100 w-100 overflow-hidden">
          <h4 class="text-center">{{ title }}</h4>
          <transition-page>
            <router-view />
          </transition-page>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'
import { getLoginDomain } from '@/utils/common/cookie'
import { getI18nVal, getI18nColorVal } from '@/utils/i18n'

export default {
  name: 'AccountIndex',
  data () {
    return {
      prevHeight: 0,
      regionsLoading: false,
    }
  },
  computed: {
    ...mapGetters(['auth', 'userInfo', 'loginLogo']),
    ...mapState({
      regions: state => state.auth.regions,
      loggedUsers: state => state.auth.loggedUsers,
      companyInfo: state => state.app.companyInfo,
    }),
    title () {
      if (this.$route.name === 'Auth') {
        return this.$t('auth.login')
      }
      if (this.$route.name === 'LoginChooser') {
        return this.$t('auth.chooser')
      }
      return '-'
    },
    loginDomain () {
      if (this.$route.query.domain) {
        return this.$route.query.domain
      }
      if (getLoginDomain()) {
        return getLoginDomain()
      }
      return ''
    },
    hasLoginDomain () {
      return this.loginDomain.length > 0
    },
    loginBg () {
      const bg_img = this.companyInfo.login_page_backgroup_image
      if (!bg_img) return `url(${require('./assets/bg.png')})`
      return `url(data:image/png;base64,${bg_img})`
    },
  },
  async created () {
    // 获取domains、regions、idps、captcha信息
    try {
      // 如果有设置为default的idp，则用default的idp方式登录
      var params = {}
      if (this.loginDomain) {
        params.domain = this.loginDomain
      }
      const { api_server, idps } = await this.$store.dispatch('auth/getRegions', params)
      const { origin, search } = window.location
      if (api_server && origin && origin !== api_server) {
        const real_host = this.gethost(origin)
        const api_host = this.gethost(api_server)
        if (real_host !== api_host) {
          if (real_host.endsWith('.' + api_host)) {
            // redirect
            const domain = real_host.substr(0, real_host.length - api_host.length - 1)
            var nsearch = 'domain=' + domain
            if (search) {
              nsearch = search + '&' + nsearch
            } else {
              nsearch = '?' + nsearch
            }
            window.location.href = `${api_server}/auth/login${nsearch}`
            return
          }
        } else {
          this.$store.dispatch('common/updateObject', {
            name: 'topAlert',
            data: {
              apiServer: {
                messageOptions: [
                  this.$t('common_222'),
                  ['a', { attrs: { href: api_server } }, api_server],
                  this.$t('common_223'),
                ],
                interval: 1000 * 60 * 60 * 24,
              },
            },
          })
        }
      }
      if (this.$route.name !== 'LoginChooserDefault') {
        const defaultIdps = idps.filter(item => item.is_default)
        if (defaultIdps && defaultIdps.length) {
          return this.handleClickIdp(defaultIdps[0])
        }
      }
      this.regionsLoading = true
    } catch (error) {
      this.regionsLoading = true
    }
    const data = Object.entries(this.loggedUsers)
    // 查看SSO登录跳转回来后的query信息，是否有error
    const { query, path } = this.$route
    const { result, error_class } = query
    if (result === 'error') {
      this.$notification.error({
        class: 'error-notification',
        message: error_class,
        icon: h => <a-icon type="info-circle" class="error-color" />,
      })
      this.$router.replace({
        path,
        query: {
          pathAuth: query.pathAuth,
          path: query.path,
        },
      })
      return false
    }
    // 如果包含历史账号，则显示历史账号
    if (!R.isEmpty(data)) {
      this.$router.replace({
        path: '/auth/login/chooser',
        query,
      })
    } else {
      this.$router.replace({
        path: '/auth/login',
        query,
      })
    }
  },
  methods: {
    gethost (str) {
      if (str.startsWith('http://')) {
        return str.substr(7)
      }
      if (str.startsWith('https://')) {
        return str.substr(8)
      }
      return str
    },
    getI18nVal,
    getI18nColorVal,
  },
}
</script>

<style lang="less">
.login-index-left {
  height: 420px;
  // background-image: url('./assets/bg.png');
  background-repeat: no-repeat;
  background-position: center left;
  background-color: #fff;
  background-size: cover;
}
.login-index-left {
  h2 {
    margin-bottom: 30px;
    font-weight: 400;
    font-size:34px;
  }
  h4 {
    margin-bottom: 30px;
    font-weight: 400;
    font-size:22px;
  }
  h6 {
    font-weight: 400;
    color:rgb(102,102,102);
    font-size:16px;
  }
}
.login-index-right {
  min-height: 420px;
  min-width: 400px;
  width: 400px;
}
.login-content-wrap {
  padding: 20px 60px 20px;
  > h4 {
    font-weight: 400;
    margin-bottom: 40px;
  }
}
.fast-login-title {
  font-size: 12px;
  color: #999;
  > span {
    width: 40px;
    height: 1px;
    background-color: #d9d9d9;
  }
}
.fast-login-item {
  height: 35px;
  overflow: hidden;
  img {
    height: 60%;
  }
}
</style>
