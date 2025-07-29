<template>
  <div class="navbar-wrap d-flex align-items-center" @click.stop.prevent="handleCloseSidebar">
    <template v-if="authInfoLoaded">
      <a-tooltip :title="$t('navbar.button.menu')" placement="right">
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
    <div class="flex-fill d-flex align-items-center h-100">
      <div class="header-logo ml-2">
        <img class="logo" :src="logo" />
      </div>
      <h1 class="header-title ml-3">{{ $t('common_210') }}</h1>
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
                <li v-if="systemProjects.length === 1" class="item-link" @click="() => projectChange(systemProjects[0].id, 'system')">
                  <div class="d-flex h-100 align-items-center">
                    <div class="flex-fill text-truncate">{{ $t('navbar.view.system_manager') }}</div>
                    <div style="width: 20px;" class="ml-1">
                      <a-icon v-show="scope === 'system' && systemProjects[0].id === userInfo.projectId" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                    </div>
                  </div>
                </li>
                <li v-else>
                  <div>{{ $t('navbar.view.system_manager') }}</div>
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
                  <div>{{$t('navbar.view.domain_manager')}}</div>
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
                  <div>{{$t('navbar.view.project')}}</div>
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
              <icon type="navbar-view-switch" style="font-size: 24px; line-height: normal;" />
            </a-tooltip>
            <span class="ml-2 current-view-label text-truncate" style="line-height: normal;" :title="viewLabel">{{ viewLabel }}</span>
            <icon type="caret-down" style="font-size: 24px; line-height: normal;" />
          </div>
        </a-popover>
      </div>
      <!-- 系统选择 -->
      <div class="navbar-item d-flex align-items-center justify-content-end" v-if="products">
        <a-dropdown :trigger="['click']">
          <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
            <icon type="navbar-setting" style="font-size: 24px; line-height: 1;" />
            <span class="ml-2">{{$t('dictionary.endpoint')}}</span>
            <icon type="caret-down" style="font-size: 24px; line-height: normal;" />
          </div>
          <a-menu slot="overlay" @click="productChange">
            <a-menu-item v-for="item of products" :key="item.key">{{ item.label }}</a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
    <!-- 资源报警 -->
    <alertresource v-if="showAlertresource" :res_total="alertresource.total" class="navbar-item-icon primary-color-hover" />
    <!-- 消息中心 -->
    <notify-popover class="navbar-item-icon primary-color-hover" :notifyMenuTitleUsedText="notifyMenuTitleUsedText" v-if="showNotify" />
    <!-- cloudshell -->
    <cloud-shell v-if="isAdminMode" class="navbar-item-icon primary-color-hover" />
    <!-- 更多 -->
    <more-popover class="navbar-item-icon primary-color-hover" :showMenuMap="{more: true, docs: true, about: true}" />
    <div class="navbar-item">
      <a-dropdown :trigger="['click']">
        <!-- <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <icon type="navbar-user" style="font-size: 24px;" />
        </div> -->
        <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <a-avatar style="color: #fff;" class="primary-color-bg">{{ firstNameWord }}</a-avatar>
          <span class="ml-2 text-truncate" style="max-width: 100px;">{{ username }}</span>
        </div>
        <a-menu slot="overlay" @click="userMenuClick">
          <a-sub-menu v-if="!supportLanguages.length || supportLanguages.length > 1" key="language">
            <span slot="title"><a-icon class="mr-2 ml-2" type="global" /><span>{{$t('common_630')}}</span></span>
            <a-menu-item v-if="!supportLanguages.length || supportLanguages.includes('zh-CN')" key="3" @click="settingLanguageCH">
              <span class="mr-2" style="cursor: pointer">简体中文</span><a-icon v-show="language === 'zh-CN'" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
            </a-menu-item>
            <a-menu-item v-if="!supportLanguages.length || supportLanguages.includes('en')" key="4" @click="settingLanguageEN">
              <span class="mr-2" style="cursor: pointer">English</span><a-icon v-show="language === 'en'" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
            </a-menu-item>
            <a-menu-item v-if="!supportLanguages.length || supportLanguages.includes('ja-JP')" key="5" @click="settingLanguageJP">
              <span class="mr-2" style="cursor: pointer">日本語</span><a-icon v-show="language === 'ja-JP'" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item key="toClouduser" v-if="showClouduser"><a-icon class="mr-2 ml-2" type="cloud-upload" />{{ $t('scope.cloudid') }}</a-menu-item>
          <a-menu-item key="handleUpdatePassword"><a-icon class="mr-2 ml-2" type="usergroup-delete" />{{ $t('scope.text_5') }}</a-menu-item>
          <a-menu-item key="logout"><a-icon class="mr-2 ml-2" type="logout" />{{ $t('scope.text_6') }}</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get'
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'
import storage from '@/utils/storage'
import Alertresource from '@/sections/Navbar/components/Alertresource'
import { setLanguage } from '@/utils/common/cookie'
import CloudShell from '@/sections/Navbar/components/CloudShell'
import NotifyPopover from '@/sections/Navbar/components/NotifyPopover'
import MorePopover from '@/sections/Navbar/components/MorePopover'
import WindowsMixin from '@/mixins/windows'
import { hasSetupKey } from '@/utils/auth'

export default {
  name: 'Navbar',
  components: {
    CloudShell,
    Alertresource,
    NotifyPopover,
    MorePopover,
  },
  mixins: [WindowsMixin],
  props: {
    showViewSelection: {
      type: Boolean,
      default: true,
    },
    showNotify: {
      type: Boolean,
      default: true,
    },
    notifyMenuTitleUsedText: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      viewChangePopoverVisible: false,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo', 'scope', 'logo', 'permission', 'scopeResource', 'setting']),
    ...mapState('app', {
      alertresource: state => state.alertrecords,
    }),
    username () {
      return this.userInfo.displayname || this.userInfo.name || 'OneCloud'
    },
    firstNameWord () {
      const word = this.username.split('')[0]
      return word && word.toUpperCase()
    },
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
    systemProjects () {
      return this.projects.filter(v => v.system_capable === true)
    },
    domainProject () {
      return R.find(R.propEq('domain_capable', true))(this.projects)
    },
    domainProjects () {
      const ret = this.projects.filter(v => v.domain_capable === true)
      return R.uniqWith((a, b) => {
        return this.isSingleProject(ret, a) && this.isSingleProject(ret, b) &&
          a.domain_id === b.domain_id && R.equals(a.domain_policies, b.domain_policies)
      })(ret)
    },
    viewLabel () {
      if (this.reLogging) return '-'
      if (this.$store.getters['auth/isAdmin']) {
        return this.$t('navbar.view.system_manager')
      }
      if (this.$store.getters['auth/isDomain']) {
        return this.isOperation ? this.$t('navbar.view.manager') : this.$t('navbar.view.domain_manager_1var', { domain: this.userInfo.projectDomain || '-' })
      }
      return this.userInfo.projectName || '-'
    },
    // 认证信息加载完毕
    authInfoLoaded () {
      return !!this.userInfo.roles && !!this.permission && !!this.scopeResource
    },
    language () {
      return this.setting.language
    },
    showAlertresource () {
      if (this.isAdminMode) {
        if (this.alertresource) {
          return this.alertresource.total > 0
        }
      }
      return false
    },
    showClouduser () {
      return hasSetupKey(['public', 'hcso'])
    },
    globalSettingSetupKeys () {
      const { globalSetting } = this.$store.state
      if (globalSetting && globalSetting.value) {
        return globalSetting.value.setupKeys
      }
      return []
    },
    supportLanguages () {
      const languages = this.globalSettingSetupKeys.filter(item => ['zh-CN', 'en', 'ja-JP'].includes(item))
      return languages
    },
  },
  watch: {
    userInfo: {
      handler (val, oldVal = {}) {
        if (val.id !== oldVal.id) {
          if ((R.isNil(val.projects) || R.isEmpty(val.projects)) && (R.isNil(val.projectId) || R.isEmpty(val.projectId))) {
            this.$router.push('/no-project')
          }
          this.fetchOEM(val)
        }
      },
      immediate: true,
    },
    supportLanguages: {
      handler: function (val) {
        this.setSupportLanguages(val)
        if (val.length && !val.includes(this.language)) {
          const navigatorL = navigator.language || navigator.userLanguage
          setLanguage(val.includes(navigatorL) ? navigatorL : val[0])
          window.location.reload()
        }
      },
      immediate: true,
    },
  },
  created () {
    this.pushApiServerUrlAlert(this.userInfo.id)
    this.cronjobFetchAlerts()
  },
  methods: {
    async userMenuClick (item) {
      if (item.key === 'logout') {
        try {
          await this.$store.dispatch('auth/logout')
          this.$router.push('/auth/login')
        } catch (error) {
          throw error
        }
      } else if (item.key === 'handleUpdatePassword') {
        this.createDialog('UpdateUserPasswordDialog')
      } else if (item.key === 'toClouduser') {
        this.$router.push('/clouduser')
      }
    },
    projectChange (id, scope) {
      this.viewChangePopoverVisible = false
      if (this.userInfo.projectId === id && this.scope === scope) return
      this.reLogin(id, scope)
    },
    productChange (item) {
      window.open(item.key, '_blank')
    },
    async reLogin (projectId, scope) {
      this.reLogging = true
      try {
        await this.$store.dispatch('auth/login', {
          tenantId: projectId,
        })
        await this.$store.commit('auth/SET_SCOPE', scope)
        await this.$store.commit('auth/SET_TENANT', projectId)
        await this.$store.commit('auth/UPDATE_HISTORY_USERS', {
          key: this.$store.getters['auth/currentLoggedUserKey'],
          value: {
            tenant: projectId,
            scope,
          },
        })
        await this.$store.commit('auth/UPDATE_HISTORY_USERS', {
          key: this.$store.getters['auth/currentLoggedUserKey'],
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
    settingLanguageCH () {
      setLanguage('zh-CN')
      window.location.reload()
    },
    settingLanguageEN () {
      setLanguage('en')
      window.location.reload()
    },
    settingLanguageJP () {
      setLanguage('ja-JP')
      window.location.reload()
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
    cronjobFetchAlerts () { // 定时5分钟请求一次
      const userInfo = this.$store.getters.userInfo
      if ((R.isNil(userInfo.projects) || R.isEmpty(userInfo.projects)) && (R.isNil(userInfo.projectId) || R.isEmpty(userInfo.projectId))) {
        return
      }
      this.$store.dispatch('app/fetchAlertingrecords')
      setInterval(() => {
        this.$store.dispatch('app/fetchAlertingrecords')
      }, 5 * 60 * 1000)

      if (this.isAdminMode && this.$store._actions['app/fetchAlertresource']) {
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
    fetchOEM (val) {
      if (val) {
        this.$store.dispatch('app/fetchOEM')
      }
    },
    setSupportLanguages (val) {
      storage.set('__oc_support_languages__', val)
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../src/styles/less/theme';

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
  // border-left: 1px solid #f5f5f5;
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
.header-logo {
  line-height: 1;
  img {
    width: 30px;
    border-radius: 50%;
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
  &:hover {
    &::after {
      background-color: rgb(241, 241, 241);
    }
  }
}
</style>
