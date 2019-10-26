<template>
  <div>
    <a-dropdown :trigger="['click']">
      <div class="trigger d-flex align-items-center justify-content-center">
        <icon type="navbar-user" style="font-size: 24px;" />
      </div>
      <a-menu slot="overlay" @click="handleDropdownClick">
        <a-menu-item key="toUser">用户信息</a-menu-item>
        <a-menu-item key="toCredentials">AccessKey 管理</a-menu-item>
        <a-menu-item key="handleUpdatePassword" v-if="showUpdatePassword">更改密码</a-menu-item>
        <a-menu-item key="handleLogout">退出</a-menu-item>
      </a-menu>
    </a-dropdown>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'UserPopover',
  mixins: [WindowsMixin],
  computed: {
    ...mapGetters(['userInfo']),
    showUpdatePassword () {
      return !this.userInfo.hasOwnProperty('idp_driver') || this.userInfo.idp_driver === 'sql'
    },
  },
  methods: {
    handleLogout () {
      this.$store.dispatch('auth/logout')
      this.$router.push('/auth')
    },
    toCredentials () {
      window.location.href = `${this.$appConfig.v1Perfix}/credentials`
    },
    toUser () {
      window.location.href = `${this.$appConfig.v1Perfix}/user`
    },
    handleUpdatePassword () {
      this.createDialog('UpdateUserPasswordDialog')
    },
    handleDropdownClick (item) {
      this[item.key]()
    },
  },
}
</script>

<style lang="scss" scoped>
.trigger {
  height: 100%;
  padding: 0 20px;
  cursor: pointer;
  text-decoration: none;
}
</style>
