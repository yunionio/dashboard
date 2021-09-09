<template>
  <div class="h-100 w-100 auth-login">
    <!-- auth layout header -->
    <div class="w-100 position-fixed header">
      <div class="container">
        <div class="auth-header d-flex align-items-center">
          <div class="auth-header-left d-flex align-items-center flex-shrink-0 flex-grow-0">
            <img class="auth-header-logo" :src="loginLogo" />
            <h2 class="name">{{ getI18nVal(companyInfo, 'name') || $t('scope.login.app.name') }}</h2>
          </div>
          <!-- 多语言切换按钮 -->
          <div class="auth-header-right flex-fill d-flex justify-content-end">
            <a-dropdown :trigger="['click']">
              <div class="oc-pointer">
                <a-icon type="global" />
                <span class="ml-2">{{ language === 'zh-CN' ? '简体中文' : 'English' }}</span>
                <icon class="ml-2" type="pull-down" />
              </div>
              <a-menu slot="overlay" @click="handleChangeLanguage">
                <a-menu-item key="zh-CN">
                  <span class="mr-2">简体中文</span><a-icon v-show="language === 'zh-CN'" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                </a-menu-item>
                <a-menu-item key="en">
                  <span class="mr-2">English</span><a-icon v-show="language === 'en'" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </div>
        <top-alert />
      </div>
    </div>
    <!-- auth layout content -->
    <div class="w-100 h-100 content d-flex overflow-auto">
      <div class="container" style="margin: 0 auto;">
        <div class="container-wrap d-flex h-100" :class="{'h-100': isLogin, 'align-items-center justify-content-center': !isLogin}">
          <template v-if="!statusLoaded">
            <div>{{ $t('common.text00111') }}</div>
          </template>
          <template v-else-if="ticketLogging">
            <div>{{ $t('auth.logging') }}</div>
          </template>
          <template v-else>
            <router-view class="content-wrap" />
          </template>
        </div>
      </div>
    </div>
    <!-- auth layout footer -->
    <div class="position-fixed w-100 text-center text-color-help footer">
      <p class="text-color-help m-0 p-0">{{ getI18nVal(companyInfo, 'copyright') }}</p>
      <template v-if="!isChrome">
        <p class="mini-text m-0 p-0 pt-2" style="color: rgba(255, 255, 255, .2);">{{ $t('common.text00110') }}</p>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { isChrome } from '@/utils/utils'
import { setLanguage } from '@/utils/common/cookie'
import TopAlert from '@/sections/TopAlert'
import { getI18nVal } from '@/utils/i18n'

export default {
  name: 'AuthLayout',
  components: {
    TopAlert,
  },
  data () {
    return {
      statusLoaded: false,
      ticketLogging: false,
    }
  },
  computed: {
    ...mapGetters(['copyright', 'loginLogo', 'setting']),
    ...mapState({
      companyInfo: state => state.app.companyInfo,
    }),
    isChrome () {
      return isChrome()
    },
    language () {
      return this.setting.language
    },
    isLogin () {
      return this.$route.path.indexOf('login') > -1
    },
  },
  async created () {
    // if (this.$route.query.ticket) {
    //   this.ticketLogin()
    // } else {
    //   this.checkRegistersStatus()
    // }
    if (this.$route.query.result === 'success') {
      await this.$store.dispatch('auth/onAfterLogin')
      this.statusLoaded = true
    } else {
      this.checkRegistersStatus()
    }
  },
  methods: {
    // 检查是否已注册
    async checkRegistersStatus () {
      try {
        await this.$store.dispatch('auth/getRegistersStatus')
        if (!this.$store.state.auth.registersStatus) {
          this.$router.replace('/auth/adminregister')
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.statusLoaded = true
      }
    },
    // ticket login
    // async ticketLogin () {
    //   this.ticketLogging = true
    //   try {
    //     const response = await this.$store.dispatch('auth/login', {
    //       cas_ticket: this.$route.query.ticket,
    //     })
    //     await this.$store.dispatch('auth/onAfterLogin', response)
    //   } catch (error) {
    //     this.$message.error(this.$t('auth.login.fast.login.fail'))
    //     this.ticketLogging = false
    //     throw error
    //   }
    // },
    handleChangeLanguage (e) {
      setLanguage(e.key)
      window.location.reload()
    },
    getI18nVal,
  },
}
</script>

<style lang="less" scoped>
.header {
  height: 70px;
  top: 0;
  left: 0;
  z-index: 3;
  background-color: #fff;
  border-bottom: 1px solid #e1e1e1;
  .auth-header {
    padding: 10px 0;
  }
  .auth-header-logo {
    height: 39px;
    margin-left: 61px;
  }
}
.content {
  // padding: 70px 0;
  box-sizing: border-box;
  // .container-wrap {
  //   background-image: url(/img/bg.eee05042.png);
  //   background-repeat: no-repeat;
  //   background-position: center center;
  // }
}
.auth-login .container {
  padding-left: 0 !important;
}
@media (min-width: 1200px) {
  .auth-login .container {
      max-width: 1920px !important;
  }
}
@media (min-width: 2560px) {
  .auth-login .container {
      max-width: 2560px !important;
  }
}
.footer {
  height: 70px;
  line-height: 70px;
  bottom: 0;
  left: 0;
  background-color: #fff;
  border-top: 1px solid #e1e1e1;
}
.name {
  font-size: 24px;
  margin-top: 13px;
  margin-left: 20px;
  padding-left: 23px;
  border-left: 2px solid #ccc;
}
</style>
