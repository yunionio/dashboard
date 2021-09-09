<template>
  <div class="d-flex h-100 w-100">
    <div class="login-index-wrap d-flex" v-loading.fullscreen="!regionsLoading">
      <div class="login-index-left d-flex flex-column justify-content-center" :style="{backgroundImage: loginBg}">
        <div class="login-index-left-content">
          <h2>{{ getI18nVal(companyInfo, 'login_page_slogan') || $t('login.desc1') }}</h2>
          <h4>{{ getI18nVal(companyInfo, 'login_page_sub_slogan') || $t('login.desc2') }}</h4>
        </div>
      </div>
      <div class="login-index-right d-flex flex-column justify-content-center align-items-center bg-white">
        <!-- login form -->
        <div class="position-relative login-form">
          <div class="login-content-wrap w-100 overflow-hidden">
            <h4>{{ title }}</h4>
            <transition-page>
              <router-view />
            </transition-page>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'
import { getLoginDomain } from '@/utils/common/cookie'
import { getI18nVal } from '@/utils/i18n'

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
        return this.$t('scope.auth.login')
      }
      if (this.$route.name === 'LoginChooser') {
        return this.$t('scope.auth.chooser')
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
  },
}
</script>

<style lang="less">
.login-index-wrap {
  width: 100%;
}
.login-index-left {
  flex-grow: 3;
  background-image: url('./assets/bg.png');
  background-repeat: no-repeat;
  background-position: right top;
  background-color: #fff;
  background-size: cover;
  h2 {
    font-size: 70px;
    font-family: Source Han Sans CN;
    font-weight: bold;
    color: #000;
  }
  h4 {
    margin-top: 17px;
    font-size: 26px;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: rgba(0, 0, 0, .8);
  }
  h6 {
    font-weight: 400;
    font-size:16px;
    color: #fff;
  }
}
.login-index-left-content {
  margin-left: 145px;
  margin-top: 160px;
}
.login-index-right {
  flex-grow: 2;
}
.login-form {
  min-height: 420px;
  width: 380px;
}
.login-content-wrap {
  // padding: 20px 60px 20px;
  padding-left: 10px;
  > h4 {
    margin-bottom: 38px;
    height: 36px;
    font-size: 36px;
    font-family: 'Source Han Sans CN';
    font-weight: bold;
    line-height: 41px;
    color: #000000;
    opacity: 1;
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
