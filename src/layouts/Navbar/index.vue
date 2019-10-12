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
          <span class="ml-2">{{ displayProjectLabel }}</span>
          <a-icon type="down" class="ml-2 mt-1" />
        </div>
        <a-menu slot="overlay" @click="projectChange">
          <a-menu-item v-for="item of projects" :key="`${item.id}$$project`">
            <a-radio :checked="item.id === userInfo.projectId && scope === 'project'" />{{ item.name }}
          </a-menu-item>
          <template v-if="systemProject || domainProject">
            <a-menu-divider />
            <template v-if="!systemProject && domainProject">
              <a-menu-item scope="domain" :key="`${domainProject.id}$$domain`">
                <a-radio :checked="domainProject.id === userInfo.projectId &&  scope === 'domain'" />域管理后台
              </a-menu-item>
            </template>
            <template v-else>
              <a-menu-item scope="system" :key="`${systemProject.id}$$system`">
                <a-radio :checked="systemProject.id === userInfo.projectId &&  scope === 'system'" />管理后台
              </a-menu-item>
            </template>
          </template>
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

export default {
  name: 'Navbar',
  computed: {
    ...mapGetters(['userInfo', 'scope']),
    projects () {
      return R.sort((a, b) => {
        return a.name.localeCompare(b.name)
      }, this.userInfo.projects)
    },
    systemProject () {
      return R.find(R.propEq('system_capable', true))(this.projects)
    },
    domainProject () {
      return R.find(R.propEq('domain_capable', true))(this.projects)
    },
    displayProjectLabel () {
      let ret = this.userInfo.projectName
      if (this.$store.getters['auth/isAdmin']) {
        ret = '管理后台'
      }
      if (this.$store.getters['auth/isDomain']) {
        ret = '域管理后台'
      }
      return ret
    },
  },
  methods: {
    userMenuClick (item) {
      if (item.key === 'logout') {
        this.$store.dispatch('auth/logout')
        this.$router.push('/auth')
      }
    },
    projectChange (item) {
      const [projectId, scope] = item.key.split('$$')
      if (this.userInfo.projectId === projectId && this.scope === scope) return
      this.reLogin(projectId, scope)
    },
    async reLogin (projectId, scope) {
      await this.$store.dispatch('auth/reLogin', {
        projectId,
        scope,
      })
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
