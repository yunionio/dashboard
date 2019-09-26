<template>
  <div class="navbar-wrap d-flex align-items-center">
    <div class="flex-fill d-flex align-items-center">
      <div class="header-logo ml-2">
        <icon name="logo" />
      </div>
      <h1 class="header-title ml-3">管理控制台</h1>
    </div>
    <div class="navbar-item d-flex align-items-center justify-content-end">
      <a-dropdown :trigger="['click']">
        <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <a-icon type="rocket" class="icon" />
          <span class="ml-2">{{ userInfo.projectName }}</span>
          <a-icon type="down" class="ml-2 mt-1" />
        </div>
        <a-menu slot="overlay" @click="projectChange">
          <a-menu-item v-for="item of projects" :key="item.id">{{ item.name }}</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <div class="navbar-item">
      <a-dropdown :trigger="['click']">
        <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <a-icon type="user" class="icon" />
          <span class="ml-2">{{ userInfo.name }}</span>
          <a-icon type="down" class="ml-2 mt-1" />
        </div>
        <a-menu slot="overlay" @click="userMenuClick">
          <a-menu-item key="logout">退出</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { logout } from '@/utils/auth'

export default {
  name: 'Navbar',
  computed: {
    ...mapGetters(['userInfo']),
    projects () {
      return R.sort((a, b) => {
        return a.name.localeCompare(b.name)
      }, this.userInfo.projects)
    },
  },
  methods: {
    userMenuClick (item) {
      if (item.key === 'logout') {
        logout()
        this.$router.push('/auth')
      }
    },
    projectChange (item) {
      this.reLogin(item.key)
    },
    async reLogin (pid) {
      await this.$store.dispatch('auth/login', {
        tenantId: pid,
      })
      await this.$store.dispatch('auth/getInfo')
    },
  },
}
</script>

<style lang="scss" scoped>
.navbar-wrap {
  color: #606266;
  height: 60px;
  box-shadow: 0 2px 4px 0 hsla(0,0%,93%,.5), 0 2px 4px 0 hsla(0,0%,93%,.5);
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: #fff;
}
.navbar-item {
  height: 100%;
  border-left: 1px solid #f5f5f5;
}
.navbar-item-trigger {
  height: 100%;
  padding: 0 20px;
  cursor: pointer;
  text-decoration: none;
  .icon {
    font-size: 18px;
  }
}
.header-logo {
  .oc-icon {
    font-size: 42px;
  }
}
.header-title {
  margin: 0;
  padding: 0;
  font-weight: normal;
  font-size: 18px;
}
</style>
