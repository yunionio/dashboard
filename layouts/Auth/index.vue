<template>
  <div class="h-100 w-100">
    <!-- auth layout header -->
    <div class="w-100 position-fixed border-bottom primary-color-border header">
      <div class="container">
        <div class="auth-header d-flex align-items-center">
          <div class="auth-header-left flex-shrink-0 flex-grow-0">
            <img class="auth-header-logo" :src="loginLogo" />
          </div>
          <!-- 多语言切换按钮 -->
          <div class="auth-header-right flex-fill d-flex justify-content-end">
            <a-dropdown :trigger="['click']">
              <div class="oc-pointer">
                <a-icon type="global" />
                <span class="ml-2">{{ language === 'zh-CN' ? $t('common_68') : 'English' }}</span>
              </div>
              <a-menu slot="overlay" @click="handleChangeLanguage">
                <a-menu-item key="zh-CN">
                  <span class="mr-2">{{$t('common_68')}}</span><a-icon v-show="language === 'zh-CN'" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                </a-menu-item>
                <a-menu-item key="en">
                  <span class="mr-2">English</span><a-icon v-show="language === 'en'" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </div>
      </div>
    </div>
    <!-- auth layout content -->
    <div class="w-100 h-100 content d-flex overflow-auto">
      <div class="container" style="margin: auto">
        <div class="container-wrap d-flex align-items-center justify-content-center w-100">
          <template v-if="!statusLoaded">
            <div class="text-white">{{ $t('common.text00111') }}</div>
          </template>
          <template v-else-if="ticketLogging">
            <div class="text-white">{{ $t('auth.logging') }}</div>
          </template>
          <template v-else>
            <router-view class="content-wrap" />
          </template>
        </div>
      </div>
    </div>
    <!-- auth layout footer -->
    <div class="position-fixed w-100 text-center text-color-help footer">
      <p class="text-color-help m-0 p-0">{{ copyright }}</p>
      <template v-if="!isChrome">
        <p class="mini-text m-0 p-0 pt-2" style="color: rgba(255, 255, 255, .2);">{{ $t('common.text00110') }}</p>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { isChrome } from '@/utils/utils'
import { setLanguage } from '@/utils/common/cookie'

export default {
  name: 'AuthLayout',
  data () {
    return {
      statusLoaded: false,
      ticketLogging: false,
    }
  },
  computed: {
    ...mapGetters(['copyright', 'loginLogo', 'setting']),
    isChrome () {
      return isChrome()
    },
    language () {
      return this.setting.language
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
  },
}
</script>

<style lang="less">
.header {
  height: 70px;
  top: 0;
  left: 0;
  z-index: 3;
  background-color: #fff;
  .auth-header {
    padding: 15px 0;
  }
  .auth-header-logo {
    height: 39px;
  }
}
.content {
  padding: 70px 0;
  box-sizing: border-box;
  .container-wrap {
    background-image: url(/img/bg.eee05042.png);
    background-repeat: no-repeat;
    background-position: center center;
  }
}
.footer {
  height: 70px;
  line-height: 70px;
  bottom: 0;
  left: 0;
  background-color: #fff;
}
</style>
