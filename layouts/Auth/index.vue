<template>
  <div class="d-flex flex-column h-100 w-100">
    <div class="flex-grow-0 flex-shrink-0">
      <!-- auth layout header -->
      <div class="border-bottom primary-color-border">
        <div class="container">
          <div class="auth-header d-flex align-items-center">
            <div class="auth-header-left flex-shrink-0 flex-grow-0">
              <img class="auth-header-logo" :src="loginLogo" />
            </div>
            <!-- 多语言切换按钮 -->
            <div class="auth-header-right flex-fill d-flex justify-content-end">
              <a-dropdown :trigger="['click']">
                <a-icon type="global" class="oc-pointer" />
                <a-menu slot="overlay" @click="handleChangeLanguage">
                  <a-menu-item key="zh-CN">
                    <a>{{$t('common_68')}}</a>
                  </a-menu-item>
                  <a-menu-item key="en">
                    <a>English</a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- auth layout content -->
    <div class="flex-fill position-relative overflow-auto">
      <div class="position-absolute w-100 h-100 pt-2 pb-2" style="left: 0; top: 0;">
        <div class="container h-100">
          <div class="d-flex align-items-center justify-content-center h-100 w-100">
            <template v-if="!statusLoaded">
              <div class="text-white">{{ $t('common.text00111') }}</div>
            </template>
            <template v-else-if="ticketLogging">
              <div class="text-white">{{ $t('auth.logging') }}</div>
            </template>
            <template v-else>
              <router-view />
            </template>
          </div>
        </div>
      </div>
    </div>
    <!-- auth layout footer -->
    <div class="flex-grow-0 flex-shrink-0 p-4 text-center text-color-help">
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
    ...mapGetters(['copyright', 'loginLogo']),
    isChrome () {
      return isChrome()
    },
  },
  created () {
    if (this.$route.query.ticket) {
      this.ticketLogin()
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
    async ticketLogin () {
      this.ticketLogging = true
      try {
        const response = await this.$store.dispatch('auth/login', {
          cas_ticket: this.$route.query.ticket,
        })
        await this.$store.dispatch('auth/onAfterLogin', response)
      } catch (error) {
        this.$message.error(this.$t('auth.login.fast.login.fail'))
        this.ticketLogging = false
        throw error
      }
    },
    handleChangeLanguage (e) {
      setLanguage(e.key)
      window.location.reload()
    },
  },
}
</script>

<style lang="less">
.auth-header {
  padding: 15px 0;
}
.auth-header-logo {
  height: 39px;
}
</style>
