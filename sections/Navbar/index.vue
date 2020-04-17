<template>
  <div class="navbar-wrap d-flex align-items-center">
    <template v-if="authInfoLoaded">
      <div class="d-flex align-items-center h-100 navbar-item-trigger" @click.stop.prevent="map.visible = !map.visible">
        <icon type="onecloud-map" style="font-size: 24px;" />
      </div>
    </template>
    <template v-else>
      <div class="d-flex align-items-center h-100 navbar-item-trigger">
        <icon type="onecloud-map" style="font-size: 24px; cursor: default;" />
      </div>
    </template>
    <div class="flex-fill d-flex align-items-center h-100">
      <div class="header-logo ml-2">
        <img class="logo" :src="logo" />
      </div>
      <h1 class="header-title ml-3">管理控制台</h1>
    </div>
    <!-- 全局搜索 -->
    <div class="navbar-item d-flex align-items-center w-25 globar-search-wrapper">
      <global-search class="mx-2" />
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
    <div class="navbar-item d-flex align-items-center justify-content-end">
      <a-popover
        trigger="click"
        overlayClassName="navbar-view-change-wrap"
        v-model="viewChangePopoverVisible"
        destroyTooltipOnHide>
        <template slot="content">
          <a-menu @click="projectChange" mode="inline" :selectable="false" :inlineIndent="12" :openKeys.sync="viewOpenKeys">
            <!-- 管理后台 -->
            <template v-if="systemProject">
              <a-menu-item scope="system" :key="`${systemProject.id}$$system`">管理后台</a-menu-item>
            </template>
            <!-- 域管理后台 -->
            <template v-if="domainProjects && domainProjects.length">
              <a-sub-menu :title="`${$t('dictionary.domain')}管理后台`" key="domainProjects">
                <template v-for="item of domainProjects">
                  <a-menu-item scope="domain" :key="`${item.id}$$domain`" :title="item.name">
                    <div class="d-flex h-100 align-items-center">
                      <div class="flex-fill text-truncate">{{ item.name }}</div>
                      <div style="width: 20px;" class="ml-1">
                        <a-icon v-show="scope === 'domain' && item.id === userInfo.projectId" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                      </div>
                    </div>
                  </a-menu-item>
                </template>
              </a-sub-menu>
            </template>
            <!-- 普通项目 -->
            <template v-if="projects && projects.length">
              <a-sub-menu title="普通项目" key="projects">
                <template v-for="item of projects">
                  <a-menu-item scope="project" :key="`${item.id}$$project`" :title="item.name">
                    <div class="d-flex h-100 align-items-center">
                      <div class="flex-fill text-truncate">{{ item.name }}</div>
                      <div style="width: 20px;" class="ml-1">
                        <a-icon v-show="scope === 'project' && item.id === userInfo.projectId" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                      </div>
                    </div>
                  </a-menu-item>
                </template>
              </a-sub-menu>
            </template>
          </a-menu>
        </template>
        <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <icon type="navbar-view-switch" />
          <span class="ml-2 current-view-label text-truncate" :title="viewLabel">{{ viewLabel }}</span>
          <icon type="caret-down" style="font-size: 24px; line-height: normal;" />
        </div>
      </a-popover>
    </div>
    <!-- 消息中心 -->
    <notify-popover class="navbar-item" />
    <!-- 工单 -->
    <work-order-popover class="navbar-item" />
    <!-- 帮助 -->
    <help-popover class="navbar-item" />
    <!-- 用户 -->
    <slot name="userPopover" />
    <license-status class="licenseStatus" />
    <!-- 系统提示 -->
    <slot name="alert" />
    <!-- 全局导航 -->
    <a-drawer
      width="50%"
      placement="left"
      destroyOnClose
      :visible="map.visible"
      :zIndex="98"
      :wrapStyle="{ transition: 'none', '-webkit-transition': 'none' }"
      :bodyStyle="{ padding: '0px', paddingTop: '60px', position: 'releative', height: '100%', width: '100%' }"
      @close="handleMapClose">
      <div class="w-100 h-100 overflow-auto"><one-cloud-map @click="handleMapClose" /></div>
    </a-drawer>
  </div>
</template>

<script>
import * as R from 'ramda'
import Cookies from 'js-cookie'
import { Base64 } from 'js-base64'
import { mapGetters } from 'vuex'
import LicenseStatus from '../LicenseStatus'
import OneCloudMap from '../OneCloudMap'
import NotifyPopover from './components/NotifyPopover'
import WorkOrderPopover from './components/WorkOrderPopover'
import HelpPopover from './components/HelpPopover'
import GlobalSearch from './components/GlobalSearch'
import Cookies from 'js-cookie'

export default {
  name: 'Navbar',
  components: {
    NotifyPopover,
    WorkOrderPopover,
    HelpPopover,
    LicenseStatus,
    GlobalSearch,
    OneCloudMap,
  },
  data () {
    return {
      map: {
        visible: false,
      },
      reLogging: false,
      viewChangePopoverVisible: false,
      viewOpenKeys: [],
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'scope', 'logo', 'permission', 'scopeResource', 'auth']),
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
    domainProjects () {
      return this.projects.filter(item => item.domain_capable)
    },
    systemProject () {
      return R.find(R.propEq('system_capable', true))(this.projects)
    },
    viewLabel () {
      if (this.reLogging) return '-'
      if (this.$store.getters['auth/isAdmin']) {
        return '管理后台'
      }
      let ret = this.userInfo.projectName || '-'
      let managerLabel = ''
      if (this.$store.getters['auth/isDomain']) {
        managerLabel = `（${this.$t('dictionary.domain')}管理后台）`
      }
      return ret + managerLabel
    },
    // 认证信息加载完毕
    authInfoLoaded () {
      return !!this.userInfo.roles && !!this.permission && !!this.scopeResource
    },
  },
  watch: {
    'userInfo' (val, oldVal) {
      if (val.id !== oldVal.id) {
        if (Cookies.get('INIT_SETUP') && val.roles && val.roles.includes('admin')) {
          this.$router.push('/guide')
        }
      }
    },
    'userInfo.id' (val) {
      this.checkWorkflow(val)
      this.fetchDictionary(val)
      this.fetchOEM(val)
      this.fetchLicense(val)
    },
  },
  created () {
    this.checkWorkflow(this.userInfo.id)
    this.fetchDictionary(this.userInfo.id)
    this.fetchOEM(this.userInfo.id)
    this.fetchLicense(this.userInfo.id)
  },
  methods: {
    checkWorkflow (val) {
      if (val) {
        this.$store.dispatch('app/fetchWorkflowStatistics')
        this.$store.dispatch('app/fetchWorkflowEnabledKeys')
      }
    },
    fetchDictionary (val) {
      if (val) {
        this.$store.dispatch('app/fetchDictionary')
      }
    },
    fetchOEM (val) {
      if (val) {
        this.$store.dispatch('app/fetchOEM')
      }
    },
    fetchLicense (val) {
      if (val) {
        this.$store.dispatch('app/fetchLicense')
      }
    },
    userMenuClick (item) {
      if (item.key === 'logout') {
        this.$store.dispatch('auth/logout')
        this.$router.push('/auth')
      }
    },
    projectChange (item) {
      this.viewChangePopoverVisible = false
      let [projectId, scope] = item.key.split('$$')
      if (this.userInfo.projectId === projectId && this.scope === scope) return
      this.reLogin(projectId, scope)
    },
    productChange (item) {
      // 打开的常用系统是同域下的，则设置一个临时的session（供其他系统使用）
      const hostname = window.location.hostname
      if (item.key.includes(hostname)) {
        const obj = {
          projectId: this.userInfo.projectId,
          projectName: this.userInfo.projectName,
          name: this.userInfo.name,
          displayname: this.userInfo.displayname,
          id: this.userInfo.id,
          ...this.auth.auth,
        }
        const bStr = Base64.encode(JSON.stringify(obj))
        Cookies.set('timeauth', bStr)
      }
      window.open(item.key, '_blank')
    },
    async reLogin (projectId, scope) {
      this.reLogging = true
      try {
        await this.$store.dispatch('auth/reLogin', projectId)
        await this.$store.commit('auth/SET_SCOPE', scope)
        await this.$store.dispatch('auth/getInfo')
        await this.$store.dispatch('auth/getPermission', scope)
        await this.$store.dispatch('auth/getScopeResource')
        if (this.$appConfig.isPrivate) {
          const resolveIndexRoute = this.$router.resolve('/')
          const currentRoute = this.$route
          // 如果在首页则刷新
          if (resolveIndexRoute.route.path === currentRoute.path) {
            window.location.reload()
          } else {
            this.$router.push('/')
          }
        }
      } catch (error) {
        throw error
      } finally {
        this.reLogging = false
      }
    },
    handleMapClose () {
      this.map.visible = false
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
.globar-search-wrapper {
  max-width: 450px;
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
.licenseStatus {
  position: fixed;
  top: 60px;
  right: 2px;
  left: 0;
}
.current-view-label {
  max-width: 150px;
}
</style>

<style lang="scss">
.navbar-view-change-wrap {
  width: 200px;
  .ant-menu-inline {
    border-right: 0;
  }
  .ant-popover-inner-content {
    padding: 0;
  }
  .ant-menu-sub.ant-menu-inline > .ant-menu-item {
    height: 30px;
    line-height: 1;
  }
}
</style>
