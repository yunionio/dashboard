<template>
  <div class="navbar-wrap d-flex align-items-center" @click.stop.prevent="handleCloseSidebar">
    <div v-if="!isHiddenMenu">
      <template v-if="authInfoLoaded && isShowMenu">
        <a-tooltip :title="$t('navbar.button.menu')" placement="right">
          <div class="primary-color-hover d-flex align-items-center navbar-item-trigger justify-content-center global-map-btn ml-1 flex-shrink-0 flex-grow-0" @click.stop.prevent="handleToggleSidebar">
            <icon :type="drawerVisible ? 'close' : 'open'" style="font-size: 22px;" />
          </div>
        </a-tooltip>
      </template>
      <template v-else>
        <div class="primary-color-hover d-flex align-items-center h-100 navbar-item-trigger flex-shrink-0 flex-grow-0">
          <icon :type="drawerVisible ? 'close' : 'open'" style="font-size: 22px; cursor: default;" />
        </div>
      </template>
    </div>
    <div class="flex-fill d-flex align-items-center h-100 flex-shrink-0 flex-grow-0">
      <router-link to="/" tag="div" class="header-logo ml-2">
        <img class="logo" :src="logo" />
      </router-link>
    </div>
    <!-- 视图选择 -->
    <div class="navbar-item primary-color-hover d-flex align-items-center justify-content-end flex-shrink-0 flex-grow-0" v-if="showViewSelection">
      <a-popover
        trigger="click"
        v-model="viewChangePopoverVisible"
        destroyTooltipOnHide
        :getPopupContainer="triggerNode => triggerNode.parentNode">
        <template slot="content">
          <ul class="list-unstyled view-list-wrap" style="max-height: 60vh; overflow-y: auto;">
            <!-- 管理后台 -->
            <template v-if="systemProjects && systemProjects.length">
              <!-- <li v-if="systemProjects.length === 1" class="item-link" @click="() => projectChange(systemProjects[0].id, 'system')">
                <div class="d-flex h-100 align-items-center">
                  <div class="flex-fill text-truncate">{{ $t('navbar.view.system_manager') }}</div>
                  <div style="width: 20px;" class="ml-1">
                    <a-icon v-show="scope === 'system' && systemProjects[0].id === userInfo.projectId" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                  </div>
                </div>
              </li> -->
              <li>
                <div class="item-section-title">{{ $t('navbar.view.system_manager') }}</div>
                <ul class="list-unstyled">
                  <template v-for="item of systemProjects">
                    <li class="item-link" :key="item.id" @click="() => projectChange(item.id, 'system')">
                      <div class="d-flex h-100 align-items-center">
                        <div class="flex-fill text-truncate">{{ item.name }}({{ item.domain }})</div>
                        <div style="width: 20px;" class="ml-1">
                          <a-icon v-show="scope === 'system' && item.id === userInfo.projectId" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                        </div>
                      </div>
                    </li>
                  </template>
                </ul>
              </li>
            </template>
            <!-- 域管理后台 -->
            <template v-if="domainProjects && domainProjects.length">
              <li>
                <div class="item-section-title">{{ domainManagerTitle }}</div>
                <ul class="list-unstyled">
                  <template v-for="item of domainProjects">
                    <li class="item-link" :key="item.id" @click="() => projectChange(item.id, 'domain')">
                      <div class="d-flex h-100 align-items-center">
                        <div class="flex-fill text-truncate" v-if="isSingleProject(domainProjects, item)">{{ item.domain }}</div>
                        <div class="flex-fill text-truncate" v-else>{{ item.domain }}({{ item.name }})</div>
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
                <div class="item-section-title">{{$t('navbar.view.project')}}</div>
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
          <a-tooltip :title="$t('navbar.view.switch')" placement="right">
            <icon type="navbar-view-switch" style="font-size: 18px;" />
          </a-tooltip>
          <span class="ml-1 current-view-label text-truncate" :title="viewLabel">{{ viewLabel }}</span>
          <icon type="caret-down" style="font-size: 18px;" />
        </div>
      </a-popover>
    </div>
    <!-- 系统选择 -->
    <div class="navbar-item primary-color-hover d-flex align-items-center justify-content-end flex-shrink-0 flex-grow-0" v-if="products && showSystemChoose">
      <a-dropdown :trigger="['click']" :getPopupContainer="triggerNode => triggerNode.parentNode">
        <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <a-tooltip :title="$t('navbar.button.external_links')" placement="right">
            <icon type="navbar-setting" style="font-size: 18px;"  />
          </a-tooltip>
          <span class="ml-1 text-truncate products-label" style="line-height: normal;">{{$t('dictionary.endpoint')}}</span>
          <icon type="caret-down" style="font-size: 18px; line-height: normal;" />
        </div>
        <a-menu slot="overlay" @click="productChange">
          <a-menu-item v-for="(item, idx) of products" :key="`${item.key}$$${idx}`">{{ item.label }}</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <!-- 全局搜索 -->
    <div class="h-100 d-flex align-items-center flex-fill justify-content-center">
      <div class="globar-search-wrapper px-2" v-if="showGlobalSearch">
        <global-search />
      </div>
    </div>
    <slot name="frontNavbar" />
    <!-- 资源报警 -->
    <alertresource v-if="showAlertresource && showMenuMap.alert" :res_total="alertresource.total" class="navbar-item-icon primary-color-hover" />
    <slot name="frontNavbar2" />
    <!-- 消息中心 -->
    <notify-popover class="navbar-item-icon primary-color-hover" :notifyMenuTitleUsedText="notifyMenuTitleUsedText" v-if="showNotify && showMenuMap.notification" />
    <!-- 工单 -->
    <work-order-popover class="navbar-item-icon primary-color-hover" :workOrderMenuTitleUsedText="workOrderMenuTitleUsedText" v-if="showWorkFlow && itsmServiceEnable && showMenuMap.workflow" />
    <!-- 大屏监控 -->
    <div class="navbar-item-icon primary-color-hover" v-if="isCMPPrivate && !$store.getters.isSysCE && (isAdminMode || isDomainMode) && showMenuMap.monitor_dashboard">
      <a-tooltip :title="$t('navbar.button.monitor')" placement="right">
        <div class="d-flex align-items-center justify-content-center h-100" style="cursor: pointer;" @click="handleOpenOverview">
          <icon type="daping" style="font-size: 22px;" />
        </div>
      </a-tooltip>
    </div>
    <!-- cloudsheel -->
    <cloud-shell v-if="isAdminMode && enableCloudShell && showMenuMap.cloudshell" class="navbar-item-icon primary-color-hover" />
    <slot name="behindNavbar" />
    <!-- 更多 -->
    <slot name="morePopover" v-if="showMenuMap.more && (showMenuMap.feature_select || showMenuMap.docs || showMenuMap.about)">
      <more-popover :showMenuMap="showMenuMap" class="navbar-item-icon primary-color-hover" />
    </slot>
    <!-- 用户 -->
    <slot name="userPopover" />
  </div>
</template>

<script>
import get from 'lodash/get'
import * as R from 'ramda'
import Cookies from 'js-cookie'
import { mapGetters, mapState } from 'vuex'
import UserProjectSelect from '@/sections/UserProjectSelect'
import WindowsMixin from '@/mixins/windows'
import { getSetupInStorage, hasPermission } from '@/utils/auth'
import { uuid } from '@/utils/utils'
import NotifyPopover from './components/NotifyPopover'
// import SettingPopover from './components/SettingPopover'
import WorkOrderPopover from './components/WorkOrderPopover'
import MorePopover from './components/MorePopover'
import GlobalSearch from './components/GlobalSearch'
import Alertresource from './components/Alertresource'
import CloudShell from './components/CloudShell'

export default {
  name: 'Navbar',
  components: {
    NotifyPopover,
    // SettingPopover,
    WorkOrderPopover,
    MorePopover,
    GlobalSearch,
    Alertresource,
    CloudShell,
  },
  mixins: [WindowsMixin],
  props: {
    showNotify: {
      type: Boolean,
      default: true,
    },
    showWorkOrder: {
      type: Boolean,
      default: true,
    },
    showHelp: {
      type: Boolean,
      default: true,
    },
    showSystemChoose: {
      type: Boolean,
      default: true,
    },
    notifyMenuTitleUsedText: {
      type: Boolean,
      default: false,
    },
    workOrderMenuTitleUsedText: {
      type: Boolean,
      default: false,
    },
    settingMenuTitleUsedText: {
      type: Boolean,
      default: false,
    },
    isHiddenMenu: {
      type: Boolean,
      default: false,
    },
    showGlobalSearch: {
      type: Boolean,
      default: true,
    },
    showViewSelection: {
      type: Boolean,
      default: true,
    },
    checkLicense: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      reLogging: false,
      viewChangePopoverVisible: false,
      selectPid: '',
      isOperation: process.env.VUE_APP_PLATFORM === 'operation',
      isCMPPrivate: process.env.VUE_APP_PLATFORM === 'cmp_private',
    }
  },
  computed: {
    ...mapGetters([
      'isAdminMode',
      'isDomainMode',
      'userInfo',
      'scope',
      'logo',
      'permission',
      'scopeResource',
      'auth',
      'workflow',
      'common',
    ]),
    ...mapState('app', {
      computeStatus: state => state.license.status,
      computeLicense: state => state.license.compute,
      computeServiceNumbers: state => state.license.service_numbers,
      oem: state => state.oem,
      alertresource: state => state.alertrecords,
    }),
    enableCloudShell () {
      const { globalConfig = {} } = this.common
      const { enable_cloud_shell = true } = globalConfig
      return enable_cloud_shell
    },
    products () {
      if (this.userInfo.menus && this.userInfo.menus.length > 0) {
        const menus = this.userInfo.menus.filter(item => item.service === 'external-service').map(item => {
          return {
            key: item.url,
            label: item.name,
          }
        })
        if (menus.length > 0) {
          return menus
        }
      }
      return null
    },
    projects () {
      return R.sort((a, b) => {
        return a.name.localeCompare(b.name)
      }, this.userInfo.projects)
    },
    domainProjects () {
      const ret = this.projects.filter(v => v.domain_capable === true)
      return R.uniqWith((a, b) => {
        return this.isSingleProject(ret, a) && this.isSingleProject(ret, b) &&
          a.domain_id === b.domain_id && R.equals(a.domain_policies, b.domain_policies)
      })(ret)
    },
    systemProjects () {
      return this.projects.filter(v => v.system_capable === true)
    },
    viewLabel () {
      if (this.reLogging) return '-'
      if (this.$store.getters['auth/isAdmin']) {
        return this.$t('navbar.view.system_manager') + '-' + this.userInfo.projectName
      }
      if (this.$store.getters['auth/isDomain']) {
        return this.$t('navbar.view.domain_manager_1var', { domain: this.userInfo.projectDomain || '-' }) + '-' + this.userInfo.projectName
      }
      return this.userInfo.projectName || '-'
    },
    // 认证信息加载完毕
    authInfoLoaded () {
      return !!this.userInfo.roles && !!this.permission && !!this.scopeResource
    },
    // 以下是license相关compute
    email () {
      const email = this.oem.email
      if (!R.isNil(email) && !R.isEmpty(email)) {
        return email
      }
      return null
    },
    sn () {
      const sn = this.computeLicense.sn
      if (R.is(String, sn)) {
        return [sn]
      }
      return sn
    },
    unAuthServiceNumbers () {
      return this.computeServiceNumbers.filter(item => this.sn && !this.sn.includes(item))
    },
    licenseMessage () {
      const now = new Date()
      const days = (this.computeStatus.expire - now.getTime() / 1000) / 24 / 3600
      // 过期
      if (this.computeStatus.expired) {
        return {
          message: this.$t('common_217', [this.email]),
        }
      }
      // 超过配额
      if (this.computeStatus.prohibited) {
        return {
          message: this.$t('common_218', [this.email]),
          to: '/licenses',
        }
      }
      // 即将过期
      if (this.computeStatus.expire > 0) {
        if ((this.computeLicense.license_type === 'test' && days < 7) ||
          (this.computeLicense.license_type === 'commercial' && days < 30)) {
          return {
            message: this.$t('common_219', [this.email]),
          }
        }
      }
      // 即将超出配额
      if (this.computeStatus.exceeded) {
        return {
          message: this.$t('common_220', [this.email]),
          to: '/licenses',
        }
      }
      // 发现未被授权的服务器
      if (this.unAuthServiceNumbers && this.unAuthServiceNumbers.length) {
        return {
          message: this.$t('common_221', [this.email]),
          to: '/licenses',
        }
      }
      return null
    },
    maintenanceMessage () {
      const days = (this.computeLicense.maintenance_expire - Date.now() / 1000) / 24 / 3600

      if (this.computeLicense.maintenance_expire > 0) {
        // 即将过期
        if (days < 30) {
          return {
            message: this.$t('common.licenses.maintenance_adverb_expire.alert', [this.email]),
          }
        }
        // 已经过期
        if (days < 0) {
          return {
            message: this.$t('common.licenses.maintenance_already_expire.alert', [this.email]),
          }
        }
      }
      return null
    },
    licenseClosable () {
      return this.computeStatus.prohibited || this.computeStatus.exceeded
    },
    itsmServiceEnable () {
      const itsm = (this.userInfo.services || []).find(v => v.type === 'itsm' && v.status === true)
      return !!itsm
    },
    isShowMenu () {
      const { globalSetting } = this.$store.state
      if (!globalSetting || (globalSetting && !globalSetting.value) || (globalSetting.value && !globalSetting.value.key)) {
        return true
      }
      return globalSetting.value.key.length > 0
    },
    showAlertresource () {
      if (this.isAdminMode && this.$appConfig.isPrivate && hasPermission({ key: 'alertresources_list' })) {
        return true
      }
      return false
    },
    domainManagerTitle () {
      return this.$t('navbar.view.domain_manager')
    },
    showWorkFlow () {
      return this.showWorkOrder && this.workflow.enabledKeys?.length > 0
    },
    globalSettingSetupKeys () {
      const { globalSetting } = this.$store.state
      if (globalSetting && globalSetting.value) {
        return globalSetting.value.setupKeys || []
      }
      return []
    },
    drawerVisible () {
      return get(this.common, 'sidebar.drawerVisible', false)
    },
    showMenuMap () {
      const ret = {}
      const list = ['alert', 'notification', 'workflow', 'monitor_dashboard', 'cloudshell', 'more', 'feature_select', 'docs', 'about']
      list.map(item => {
        ret[item] = !this.$isScopedPolicyMenuHidden(`navbar_hidden_items.${item}`)
      })
      return ret
    },
  },
  watch: {
    userInfo: {
      handler (val, oldVal = {}) {
        if (val.id !== oldVal.id) {
          if (getSetupInStorage() && this.globalSettingSetupKeys.length === 0 && val.roles && val.roles.includes('admin')) {
            this.$router.push('/guide')
            return
          }
          if ((R.isNil(val.projects) || R.isEmpty(val.projects)) && (R.isNil(val.projectId) || R.isEmpty(val.projectId))) {
            this.$router.push('/no-project')
            return
          }
          this.checkProjects(val)
        }
      },
      immediate: true,
    },
    'userInfo.id' (val) {
      this.checkWorkflow(val)
      this.fetchOEM(val)
      if (this.checkLicense) {
        this.fetchLicense(val)
      }
      this.pushApiServerUrlAlert(val)
    },
    licenseMessage: {
      handler (val) {
        if (val) {
          this.$nextTick(() => {
            this.pushLicenseAlert()
          })
        }
      },
      immediate: true,
    },
    maintenanceMessage: {
      handler (val) {
        if (val) {
          this.$nextTick(() => {
            this.pushLicenseAlert('maintenance')
          })
        }
      },
      immediate: true,
    },
  },
  created () {
    this.checkWorkflow(this.userInfo.id)
    this.fetchOEM(this.userInfo.id)
    if (this.checkLicense) {
      this.fetchLicense(this.userInfo.id)
    }
    this.pushApiServerUrlAlert(this.userInfo.id)
    this.cronjobFetchAlerts()
    // 商业版数据处理
    if (process.env.VUE_APP_IS_PRIVATE && !this.$store.getters.isSysCE) {
      if (this.isAdminMode || this.isDomainMode) {
        this.$store.dispatch('bill/fetchProjectSharingAccounts')
      }
    }
  },
  methods: {
    checkWorkflow (val) {
      if (!this.itsmServiceEnable) return
      if (val) {
        this.$store.dispatch('app/fetchWorkflowStatistics')
        this.$store.dispatch('app/fetchWorkflowEnabledKeys', { $t: uuid() })
      }
    },
    fetchOEM (val) {
      if (val) {
        this.$store.dispatch('app/fetchOEM')
      }
    },
    fetchLicense (val) {
      if (val) {
        this.$store.dispatch('app/fetchLicense').catch(ret => {
          let is402 = false
          if (R.type(ret) === 'Error' || R.type(ret) === 'String') {
            is402 = ret.toString().indexOf('status code 402') > -1
          }
          if (R.type(ret) === 'Object') {
            is402 = ret.status === 402
          }
          if (is402 && this.$store.getters.isAdminMode) {
            this.createDialog('UpdateLicenseDialog')
          }
        })
      }
    },
    async userMenuClick (item) {
      if (item.key === 'logout') {
        try {
          await this.$store.dispatch('auth/logout')
          this.$router.push({
            path: '/auth/login',
            query: {
              pathAuthPage: this.$route.meta.authPage,
              pathAuth: this.$route.meta.auth || true,
              path: this.$route.path,
            },
          })
        } catch (error) {
          throw error
        }
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
      const href = item.key.split('$$')[0]
      if (href.includes(hostname)) {
        const obj = {
          projectId: this.userInfo.projectId,
          projectName: this.userInfo.projectName,
          name: this.userInfo.name,
          displayname: this.userInfo.displayname,
          id: this.userInfo.id,
          ...this.auth.auth,
        }
        const bStr = window.encodeURI(JSON.stringify(obj))
        Cookies.set('timeauth', bStr)
      }
      window.open(href, '_blank')
    },
    async reLogin (projectId, scope) {
      this.reLogging = true
      try {
        await this.$store.dispatch('auth/login', {
          tenantId: projectId,
        })
        await this.$store.commit('auth/SET_SCOPE', scope)
        await this.$store.commit('auth/SET_TENANT', projectId)
        await this.$store.commit('auth/UPDATE_LOGGED_USERS', {
          key: this.$store.getters['auth/currentLoggedUserKey'],
          value: {
            tenant: projectId,
            scope,
          },
        })
        await this.$store.commit('auth/UPDATE_HISTORY_USERS', {
          key: this.$store.getters['auth/currentHistoryUserKey'],
          value: {
            tenant: projectId,
            scope,
          },
        })
        await this.$store.dispatch('scopedPolicy/get', {
          category: ['sub_hidden_menus'],
        })
        window.location.reload()
        return true
      } catch (error) {
        throw error
      } finally {
        this.reLogging = false
      }
    },
    async pushApiServerUrlAlert (id) {
      if (!id) return
      try {
        const params = {}
        if (this.$store.getters.scope !== 'system') {
          params.domain = this.$store.getters.userInfo.projectDomain
        }
        const regions = await this.$store.dispatch('auth/getRegions', params)
        const currentHost = window.location.hostname
        const apiServer = regions.api_server || ''
        if (apiServer) {
          if (!apiServer.includes(currentHost)) {
            this.$store.dispatch('common/updateObject', {
              name: 'topAlert',
              data: {
                apiServer: {
                  messageOptions: [
                    this.$t('common_222'),
                    ['a', { attrs: { href: apiServer } }, apiServer],
                    this.$t('common_223'),
                  ],
                  interval: 1000 * 60 * 60 * 24,
                },
              },
            })
          }
        }
      } catch (error) {
        throw error
      }
    },
    pushLicenseAlert (type) {
      if (!this.isAdminMode) return false
      const messageOptions = []
      if (type === 'maintenance') {
        if (this.maintenanceMessage?.message) {
          messageOptions.push(this.maintenanceMessage?.message)
        }
      } else {
        if (this.licenseMessage?.message) {
          messageOptions.push(this.licenseMessage?.message)
        }
      }
      if (this.licenseMessage?.to) {
        messageOptions.push([
          'router-link',
          { class: 'ml-2', props: { to: this.licenseMessage.to } },
          this.$t('common_224'),
        ])
      }
      this.$store.dispatch('common/updateObject', {
        name: 'topAlert',
        data: {
          license: {
            messageOptions,
            alertProps: {
              clseable: this.licenseClosable,
            },
            interval: '1d',
          },
        },
      })
    },
    checkProjects (userInfo) {
      // 当有项目时 且 没有匹配到当前登录项目，则提示选择项目进行relogin
      if (
        (R.isEmpty(userInfo.projectId) || R.isNil(userInfo.projectId)) &&
        (!R.isEmpty(userInfo.projects) && !R.isNil(userInfo.projects))
      ) {
        this.createDialog('CommonDialog', {
          header: this.$t('common_225') + this.$t('dictionary.project'),
          body: () => {
            return this.$createElement(UserProjectSelect, {
              props: {
                value: this.selectPid,
              },
              on: {
                input: (pid) => {
                  this.selectPid = pid
                },
              },
            })
          },
          ok: () => this.reLogin(this.selectPid, 'project'),
          hiddenCancel: true,
          modalProps: {
            maskClosable: false,
            closable: false,
          },
        })
      }
    },
    handleToggleSidebar () {
      const drawerVisible = !(get(this.$store.getters, 'common.sidebar.drawerVisible', false))
      this.$store.dispatch('common/updateObject', {
        name: 'sidebar',
        data: {
          drawerVisible,
        },
      })
    },
    handleCloseSidebar () {
      this.$store.dispatch('common/updateObject', {
        name: 'sidebar',
        data: {
          drawerVisible: false,
        },
      })
    },
    handleOpenOverview () {
      const { companyInfo } = this.$store.state.app
      if (companyInfo.monitor_dashboard_style === 'overview-private2') {
        window.open('/overview-private', '_blank')
      } else if (companyInfo.monitor_dashboard_style === 'custom-url' && companyInfo.custom_url) {
        window.open(companyInfo.custom_url, '_blank')
      } else {
        window.open('/overview', '_blank')
      }
    },
    cronjobFetchAlerts () { // 定时5分钟请求一次
      const userInfo = this.$store.getters.userInfo
      if ((R.isNil(userInfo.projects) || R.isEmpty(userInfo.projects)) && (R.isNil(userInfo.projectId) || R.isEmpty(userInfo.projectId))) {
        return
      }

      this.$store.dispatch('app/fetchAlertingrecords')
      setInterval(() => {
        this.$store.dispatch('app/fetchAlertingrecords')
      }, 5 * 60 * 1000)

      if (this.isAdminMode && this.$appConfig.isPrivate && this.$store._actions['app/fetchAlertresource']) {
        // this.$store.dispatch('app/fetchAlertresource')
        // setInterval(() => {
        //   this.$store.dispatch('app/fetchAlertresource')
        // }, 5 * 60 * 1000)
      } else {
        this.$store.commit('app/SET_ALERTRESOURCE', {
          data: [],
          total: 0,
        })
      }
    },
    isSingleProject (projects, item) {
      const sameDomainProjects = projects.filter(v => v.domain_id === item.domain_id)
      const num = sameDomainProjects?.length

      if (num > 1) {
        const isAll = sameDomainProjects.every(v => {
          return R.equals(v.domain_policies, item.domain_policies)
        })

        if (isAll) {
          return true
        }
      }
      return num === 1
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../styles/less/theme';

.navbar-wrap {
  color: #606266;
  height: 60px;
  box-shadow: 0px 1px 0px 0px rgba(0, 0, 0, 0.07);
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 101;
  background-color: #fff;
}
.navbar-item {
  height: 100%;
}
.navbar-item-icon {
  width: 40px;
  height: 40px;
  margin-left: 5px;
  margin-right: 5px;
}
.navbar-item-trigger {
  height: 100%;
  padding: 0 20px;
  cursor: pointer;
  text-decoration: none;
}
.globar-search-wrapper {
  max-width: 450px;
  width: 100%;
}
.header-logo {
  line-height: 1;
  cursor: pointer;
  img {
    // width: 45px;
    height: 30px;
  }
}
.header-title {
  margin: 0;
  padding: 0;
  font-weight: 400;
  font-size: 18px;
  color: rgba(0, 0, 0, 0.85);
}
.products-label {
  max-width: 150px;
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
      color: @link-color;
    }
  }
  .item-section-title {
    // font-weight: bold;
    color: #989fa8;
  }
}
.global-map-btn {
  width: 50px;
  height: 50px;
  padding: 0 !important;
  position: relative;
  &::after {
    content: '';
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    position: absolute;
    background: #fff;
    border-radius: 50%;
    z-index: -1;
    transition: all 0.3s ease;
  }
}
@media only screen and (max-width: 1100px) {
  .header-title {
    display: none;
  }
}
@media only screen and (max-width: 980px) {
  .globar-search-wrapper {
    display: none !important;
  }
}
</style>
