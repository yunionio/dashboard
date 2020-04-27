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
        v-model="viewChangePopoverVisible"
        destroyTooltipOnHide>
        <template slot="content">
          <ul class="list-unstyled view-list-wrap">
            <!-- 管理后台 -->
            <template v-if="systemProject">
              <li class="item-link" @click="() => projectChange(systemProject.id, 'system')">
                <div class="d-flex h-100 align-items-center">
                  <div class="flex-fill text-truncate">管理后台</div>
                  <div style="width: 20px;" class="ml-1">
                    <a-icon v-show="scope === 'system' && systemProject.id === userInfo.projectId" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                  </div>
                </div>
              </li>
            </template>
            <!-- 域管理后台 -->
            <template v-if="domainProjects && domainProjects.length">
              <li>
                <div>{{ $t('dictionary.domain') }}管理后台</div>
                <ul class="list-unstyled">
                  <template v-for="item of domainProjects">
                    <li class="item-link" :key="item.id" @click="() => projectChange(item.id, 'domain')">
                      <div class="d-flex h-100 align-items-center">
                        <div class="flex-fill text-truncate">{{ item.domain }}</div>
                        <div style="width: 20px;" class="ml-1">
                          <a-icon v-show="scope === 'domain' && item.id === userInfo.projectId" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                        </div>
                      </div>
                    </li>
                  </template>
                </ul>
              </li>
            </template>
            <!-- 项目 -->
            <template v-if="projects && projects.length">
              <li>
                <div>普通项目</div>
                <ul class="list-unstyled">
                  <template v-for="item of projects">
                    <li class="item-link" :key="item.id" @click="() => projectChange(item.id, 'project')">
                      <div class="d-flex h-100 align-items-center">
                        <div class="flex-fill text-truncate">{{ item.name }}</div>
                        <div style="width: 20px;" class="ml-1">
                          <a-icon v-show="scope === 'project' && item.id === userInfo.projectId" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                        </div>
                      </div>
                    </li>
                  </template>
                </ul>
              </li>
            </template>
          </ul>
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
      const domainIds = []
      const ret = []
      R.forEach(item => {
        if (item.domain_capable && !domainIds.includes(item.domain_id)) {
          ret.push(item)
        }
        domainIds.push(item.domain_id)
      }, this.projects)
      return ret
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
        ret = this.userInfo.projectDomain || '-'
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
    userInfo: {
      handler (val, oldVal = {}) {
        if (val.id !== oldVal.id) {
          if (Cookies.get('INIT_SETUP') && val.roles && val.roles.includes('admin')) {
            this.$router.push('/guide')
            return
          }
          if (R.isNil(val.projects) || R.isEmpty(val.projects)) {
            this.$router.push('/no-project')
          }
        }
      },
      immediate: true,
    },
    'userInfo.id' (val) {
      this.checkWorkflow(val)
      this.fetchDictionary(val)
      this.fetchOEM(val)
      this.fetchLicense(val)
      this.checkApiServerUrl(val)
    },
  },
  created () {
    this.checkWorkflow(this.userInfo.id)
    this.fetchDictionary(this.userInfo.id)
    this.fetchOEM(this.userInfo.id)
    this.fetchLicense(this.userInfo.id)
    this.checkApiServerUrl(this.userInfo.id)
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
    projectChange (id, scope) {
      this.viewChangePopoverVisible = false
      if (this.userInfo.projectId === id && this.scope === scope) return
      this.reLogin(id, scope)
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
        Cookies.set('scope', scope, { expires: 7 })
        const resolveIndexRoute = this.$router.resolve('/')
        const currentRoute = this.$route
        // 如果在首页则刷新页面
        if (resolveIndexRoute.route.path === currentRoute.path) {
          window.location.reload()
        } else {
          await this.$store.dispatch('auth/getInfo')
          await this.$store.dispatch('auth/getPermission', scope)
          await this.$store.dispatch('auth/getScopeResource')
          this.$router.push('/')
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
    async checkApiServerUrl (id) {
      if (!id) return
      if (process.env.NODE_ENV !== 'production') return
      let manager = new this.$Manager('services', 'v1')
      try {
        const response = await manager.list({
          params: {
            type: ['common'],
          },
        })
        const id = (response.data.data && response.data.data.length && response.data.data[0]['id']) || ''
        if (id) {
          const configResponse = await manager.getSpecific({
            id,
            spec: 'config',
          })
          const config = (configResponse.data.config && configResponse.data.config.default) || {}
          const currentHost = window.location.hostname
          const apiServer = config.api_server || ''
          if (apiServer) {
            if (!apiServer.includes(currentHost)) {
              this.$message.warning(`当前访问控制台地址错误，请访问${apiServer}`)
            }
          }
        }
      } catch (error) {
        throw error
      } finally {
        manager = null
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../styles/_variables.scss';

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
.view-list-wrap {
  max-width: 200px;
  margin: 0;
  padding: 0;
  > li {
    padding: 5px 0;
    > ul {
      margin-top: 5px;
      > li {
        padding-left: 10px;
        height: 24px;
      }
    }
  }
  .item-link {
    cursor: pointer;
    &:hover {
      color: $link-color;
    }
  }
}
</style>
