<template>
  <div class="navbar-wrap d-flex align-items-center">
    <div class="flex-fill d-flex align-items-center h-100">
      <div class="header-logo ml-2">
        <img class="logo" :src="logo" />
      </div>
      <h1 class="header-title ml-3">管理控制台</h1>
    </div>
    <!-- 系统选择 -->
    <div class="navbar-item d-flex align-items-center justify-content-end" v-if="products">
      <a-dropdown :trigger="['click']">
        <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <icon type="navbar-setting" />
          <span class="ml-2">云管平台</span>
          <icon type="caret-down" style="font-size: 24px; line-height: normal;" />
        </div>
        <a-menu slot="overlay" @click="productChange">
          <a-menu-item v-for="item of products" :key="item.key">{{ item.label }}</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <!-- 视图选择 -->
    <div class="navbar-item d-flex align-items-center justify-content-end" v-if="systemProject || domainProject">
      <a-dropdown :trigger="['click']">
        <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <icon type="navbar-view-switch" />
          <span class="ml-2">{{ viewLabel }}</span>
          <icon type="caret-down" style="font-size: 24px; line-height: normal;" />
        </div>
        <a-menu slot="overlay" @click="projectChange">
          <a-menu-item scope="project" :key="`${projects[0].id}$$project$$${true}`">
            <a-radio :checked="scope === 'project'" />普通项目
          </a-menu-item>
          <template v-if="systemProject || domainProject">
            <template v-if="!systemProject && domainProject">
              <a-menu-item scope="domain" :key="`${domainProject.id}$$domain`">
                <a-radio :checked="scope === 'domain'" />域管理后台
              </a-menu-item>
            </template>
            <template v-else>
              <a-menu-item scope="system" :key="`${systemProject.id}$$system`">
                <a-radio :checked="scope === 'system'" />管理后台
              </a-menu-item>
            </template>
          </template>
        </a-menu>
      </a-dropdown>
    </div>
    <!-- 项目选择 -->
    <div class="navbar-item d-flex align-items-center justify-content-end" v-if="scope ==='project'">
      <a-dropdown :trigger="['click']">
        <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <icon type="navbar-project" />
          <span class="ml-2">{{ userInfo.projectName }}</span>
          <icon type="caret-down" style="font-size: 24px; line-height: normal;" />
        </div>
        <a-menu slot="overlay" @click="projectChange">
          <a-menu-item v-for="item of projects" :key="`${item.id}$$project`">
            <a-radio :checked="item.id === userInfo.projectId" />{{ item.name }}
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <template v-if="$appConfig.isPrivate">
      <!-- 消息中心 -->
      <notify-popover class="navbar-item" />
      <!-- 工单 -->
      <work-order-popover class="navbar-item" />
      <!-- 帮助 -->
      <help-popover class="navbar-item" />
      <!-- 用户 -->
      <user-popover class="navbar-item" />
    </template>
    <template v-else>
      <!-- 用户 -->
      <div class="navbar-item">
        <a-dropdown :trigger="['click']">
          <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
            <icon type="navbar-user" style="font-size: 24px;" />
          </div>
          <a-menu slot="overlay" @click="userMenuClick">
            <a-menu-item key="logout">退出</a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'

import NotifyPopover from './NotifyPopover'
import WorkOrderPopover from './WorkOrderPopover'
import HelpPopover from './HelpPopover'
import UserPopover from './UserPopover'

export default {
  name: 'Navbar',
  components: {
    NotifyPopover,
    WorkOrderPopover,
    HelpPopover,
    UserPopover,
  },
  computed: {
    ...mapGetters(['userInfo', 'scope', 'logo']),
    products () {
      if (this.userInfo.menus && this.userInfo.menus.length > 0) {
        const menus = this.userInfo.menus.map(item => {
          return {
            key: item.url,
            label: item.name,
          }
        })
        return menus
      }
      return null
    },
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
    viewLabel () {
      let ret = '普通项目'
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
      let [projectId, scope, viewMode] = item.key.split('$$')
      // 从视图下拉切换至普通项目
      if (viewMode) {
        // 优先选择 domain
        if (this.domainProject) projectId = this.domainProject.id
        if (this.systemProject) projectId = this.systemProject.id
      }
      if (this.userInfo.projectId === projectId && this.scope === scope) return
      this.reLogin(projectId, scope)
    },
    productChange (item) {
      window.open(item.key, '_blank')
    },
    async reLogin (projectId, scope) {
      await this.$store.dispatch('auth/reLogin', projectId)
      await this.$store.commit('auth/SET_SCOPE', scope)
      await this.$store.dispatch('auth/getInfo')
      await this.$store.dispatch('auth/getPermission', scope)
      await this.$store.dispatch('auth/getScopeResource')
      if (this.$appConfig.isPrivate) {
        window.location.href = this.$appConfig.v1Perfix
      }
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
}
.header-logo {
  line-height: 1;
  img {
    width: 45px;
  }
}
.header-title {
  margin: 0;
  padding: 0;
  font-weight: 400;
  font-size: 18px;
}
</style>
