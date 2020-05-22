<template>
  <div class="wrap d-flex flex-column h-100 w-100">
    <div class="flex-fill position-relative overflow-auto">
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
    <div class="flex-grow-0 flex-shrink-0 p-2 white-color text-center text-color-help">
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

export default {
  name: 'AuthLayout',
  data () {
    return {
      statusLoaded: false,
      ticketLogging: false,
    }
  },
  computed: {
    ...mapGetters(['copyright']),
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
          this.$router.replace('/auth/register')
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
        await this.$store.dispatch('auth/getInfo')
        await this.$store.dispatch('auth/onAfterLogin', response)
      } catch (error) {
        this.$message.error(this.$t('auth.login.fast.login.fail'))
        this.ticketLogging = false
        throw error
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  background-color: rgb(0, 51, 89);
  overflow: hidden;
  background-image: url('../../assets/images/login-bg.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
}
</style>
