<template>
  <div class="navbar-wrap d-flex align-items-center" @click.stop.prevent="handleCloseSidebar">
    <template v-if="authInfoLoaded">
      <a-tooltip title="导航菜单" placement="right">
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
    </div>
    <!-- 系统选择 -->
    <div class="navbar-item d-flex align-items-center justify-content-end" v-if="products">
      <a-dropdown :trigger="['click']">
        <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <icon type="navbar-setting" />
          <span class="ml-2">{{$t('dictionary.endpoint')}}</span>
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
            <a-radio :checked="scope === 'project'" />{{ $t('scope.text_253', [$t('dictionary.project')]) }}
          </a-menu-item>
          <template v-if="systemProject || domainProject">
            <template v-if="!systemProject && domainProject">
              <a-menu-item scope="domain" :key="`${domainProject.id}$$domain`">
                <a-radio :checked="scope === 'domain'" />{{ $t('navbar.view.domain_manager') }}
              </a-menu-item>
            </template>
            <template v-else>
              <a-menu-item scope="system" :key="`${systemProject.id}$$system`">
                <a-radio :checked="scope === 'system'" />{{ $t('navbar.view.system_manager') }}
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
    <div class="navbar-item">
      <a-dropdown :trigger="['click']">
        <div class="navbar-item-trigger d-flex align-items-center justify-content-center">
          <icon type="navbar-user" style="font-size: 24px;" />
        </div>
        <a-menu slot="overlay" @click="userMenuClick">
          <a-menu-item key="logout">{{ $t('scope.text_6') }}</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get'
import * as R from 'ramda'
import { mapGetters } from 'vuex'

export default {
  name: 'Navbar',
  computed: {
    ...mapGetters(['userInfo', 'scope', 'logo', 'permission', 'scopeResource']),
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
      this.reLogging = true
      try {
        await this.$store.dispatch('auth/login', {
          tenantId: projectId,
        })
        await this.$store.commit('auth/SET_SCOPE', scope)
        await this.$store.commit('auth/SET_TENANT', projectId)
        await this.$store.commit('auth/UPDATE_HISTORY_USERS', {
          key: this.userInfo.name,
          value: {
            tenant: projectId,
          },
        })
        await this.$store.commit('auth/UPDATE_HISTORY_USERS', {
          key: this.userInfo.name,
          value: {
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
