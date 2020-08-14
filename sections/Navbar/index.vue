<template>
  <div class="navbar-wrap d-flex align-items-center" @click.stop.prevent="handleCloseSidebar">
    <div v-if="!isHiddenMenu">
      <template v-if="authInfoLoaded && isShowMenu">
        <a-tooltip :title="$t('common_209')" placement="right">
          <div class="d-flex align-items-center navbar-item-trigger justify-content-center global-map-btn ml-1 flex-shrink-0 flex-grow-0" @click.stop.prevent="handleToggleSidebar">
            <icon type="menu" style="font-size: 24px;" />
          </div>
        </a-tooltip>
      </template>
      <template v-else>
        <div class="d-flex align-items-center h-100 navbar-item-trigger flex-shrink-0 flex-grow-0">
          <icon type="menu" style="font-size: 24px; cursor: default;" />
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
          <ul class="list-unstyled view-list-wrap">
            <!-- 管理后台 -->
            <template v-if="systemProject">
              <li class="item-link" @click="() => projectChange(systemProject.id, 'system')">
                <div class="d-flex h-100 align-items-center">
                  <div class="flex-fill text-truncate">{{ isOperation ? $t('common_212') : $t('common_213') }}</div>
                  <div style="width: 20px;" class="ml-1">
                    <a-icon v-show="scope === 'system' && systemProject.id === userInfo.projectId" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                  </div>
                </div>
              </li>
            </template>
            <!-- 域管理后台 -->
            <template v-if="domainProjects && domainProjects.length">
              <li>
                <div>{{ isOperation ? $t('common_213') : `${$t('dictionary.domain')} ${$t('common_214')}` }}</div>
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
                <div>{{$t('common_215')}}</div>
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
          <icon type="navbar-view-switch" style="font-size: 24px; line-height: normal;" />
          <span class="ml-2 current-view-label text-truncate" :title="viewLabel">{{ viewLabel }}</span>
          <icon type="caret-down" style="font-size: 24px; line-height: normal;" />
        </div>
      </a-popover>
    </div>
    <!-- 系统选择 -->
    <div class="navbar-item primary-color-hover d-flex align-items-center justify-content-end flex-shrink-0 flex-grow-0" v-if="products && showSystemChoose">
      <a-dropdown :trigger="['click']" :getPopupContainer="triggerNode => triggerNode.parentNode">
        <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <icon type="navbar-setting" style="font-size: 24px; line-height: normal;"  />
          <span class="ml-2 text-truncate products-label">{{$t('common_211')}}</span>
          <icon type="caret-down" style="font-size: 24px; line-height: normal;" />
        </div>
        <a-menu slot="overlay" @click="productChange">
          <a-menu-item v-for="(item, idx) of products" :key="`${item.key}$$${idx}`">{{ item.label }}</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <!-- 全局搜索 -->
    <div class="h-100 d-flex align-items-center flex-fill">
      <div class="globar-search-wrapper px-2" v-if="showGlobalSearch">
        <global-search />
      </div>
    </div>
    <slot name="frontNavbar" />
    <!-- 消息中心 -->
    <notify-popover class="navbar-item-icon primary-color-hover" :notifyMenuTitleUsedText="notifyMenuTitleUsedText" v-if="showNotify" />
    <!-- 工单 -->
    <work-order-popover class="navbar-item-icon primary-color-hover" :workOrderMenuTitleUsedText="workOrderMenuTitleUsedText" v-if="showWorkOrder && itsmServiceEnable" />
    <slot name="behindNavbar" />
    <!-- 更多 -->
    <more-popover class="navbar-item-icon primary-color-hover" />
    <!-- 用户 -->
    <slot name="userPopover" />
  </div>
</template>

<script>
import get from 'lodash/get'
import * as R from 'ramda'
import Cookies from 'js-cookie'
import { mapGetters, mapState } from 'vuex'
import NotifyPopover from './components/NotifyPopover'
// import SettingPopover from './components/SettingPopover'
import WorkOrderPopover from './components/WorkOrderPopover'
import MorePopover from './components/MorePopover'
import GlobalSearch from './components/GlobalSearch'
import UserProjectSelect from '@/sections/UserProjectSelect'
import WindowsMixin from '@/mixins/windows'
import { getSetupInStorage } from '@/utils/auth'

export default {
  name: 'Navbar',
  components: {
    NotifyPopover,
    // SettingPopover,
    WorkOrderPopover,
    MorePopover,
    GlobalSearch,
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
  },
  data () {
    return {
      reLogging: false,
      viewChangePopoverVisible: false,
      selectPid: '',
      isOperation: process.env.VUE_APP_PLATFORM === 'operation',
    }
  },
  computed: {
    ...mapGetters([
      'isAdminMode',
      'userInfo',
      'scope',
      'logo',
      'permission',
      'scopeResource',
      'auth',
    ]),
    ...mapState('app', {
      computeStatus: state => state.license.status,
      computeLicense: state => state.license.compute,
      computeServiceNumbers: state => state.license.service_numbers,
      oem: state => state.oem,
    }),
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
          domainIds.push(item.domain_id)
          ret.push(item)
        }
      }, this.projects)
      return ret
    },
    systemProject () {
      return R.find(R.propEq('system_capable', true))(this.projects)
    },
    viewLabel () {
      if (this.reLogging) return '-'
      if (this.$store.getters['auth/isAdmin']) {
        return this.isOperation ? this.$t('common_212') : this.$t('common_213')
      }
      let ret = this.userInfo.projectName || '-'
      let managerLabel = ''
      if (this.$store.getters['auth/isDomain']) {
        ret = this.userInfo.projectDomain || '-'
        managerLabel = this.isOperation ? this.$t('common_213') : ' ' + this.$t('dictionary.domain') + this.$t('common_213')
      }
      return ret + managerLabel
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
          to: 'licenses',
        }
      }
      // 即将过期
      if (this.computeStatus.expire > 0 && days < 30) {
        return {
          message: this.$t('common_219', [this.email]),
        }
      }
      // 即将超出配额
      if (this.computeStatus.exceeded) {
        return {
          message: this.$t('common_220', [this.email]),
          to: 'licenses',
        }
      }
      // 发现未被授权的服务器
      if (this.unAuthServiceNumbers && this.unAuthServiceNumbers.length) {
        return {
          message: this.$t('common_221', [this.email]),
          to: 'licenses',
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
  },
  watch: {
    userInfo: {
      handler (val, oldVal = {}) {
        if (val.id !== oldVal.id) {
          if (getSetupInStorage() && val.roles && val.roles.includes('admin')) {
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
      this.fetchLicense(val)
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
  },
  created () {
    this.checkWorkflow(this.userInfo.id)
    this.fetchOEM(this.userInfo.id)
    this.fetchLicense(this.userInfo.id)
    this.pushApiServerUrlAlert(this.userInfo.id)
  },
  methods: {
    checkWorkflow (val) {
      if (!this.itsmServiceEnable) return
      if (val) {
        this.$store.dispatch('app/fetchWorkflowStatistics')
        this.$store.dispatch('app/fetchWorkflowEnabledKeys')
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
      let manager = new this.$Manager('services', 'v1')
      try {
        const response = await manager.list({
          params: {
            type: ['common'],
          },
        })
        const id = (response.data.data && response.data.data.length && response.data.data[0].id) || ''
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
        }
      } catch (error) {
        throw error
      } finally {
        manager = null
      }
    },
    pushLicenseAlert () {
      if (!this.isAdminMode) return false
      const messageOptions = [this.licenseMessage.message]
      if (this.licenseMessage.to) {
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
  },
}
</script>

<style lang="less" scoped>
@import '../../styles/less/theme';

.navbar-wrap {
  color: #606266;
  height: 60px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 2px 4px 0 rgba(0, 0, 0, 0.05);
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
    width: 45px;
  }
}
.header-title {
  margin: 0;
  padding: 0;
  font-weight: 400;
  font-size: 18px;
  color: rgba(0,0,0,.85);
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
}
.global-map-btn {
  width: 50px;
  height: 50px;
  padding: 0 !important;
  position: relative;
  &::after {
    content: "";
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    position: absolute;
    background: #fff;
    border-radius: 50%;
    z-index: -1;
    transition: all .3s ease;
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
