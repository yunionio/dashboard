<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.domain')"
    icon="res-domain"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        button-type="link"
        button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :resource="resource"
      :getParams="getParams"
      :on-manager="onManager"
      :is-allow-create="isAllowCreate"
      :columns="columns"
      @refresh="refresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ProjectList from '@IAM/views/projects/components/List'
import UserList from '@IAM/views/user/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'
import Quota from './Quota'
import RoleList from './Role'
import CloudaccountList from './Cloudaccount'

export default {
  name: 'DomainSidePage',
  components: {
    Detail,
    Actions,
    RoleList,
    CloudaccountList,
    ProjectList,
    UserList,
    Quota,
  },
  mixins: [SidePageMixin, WindowsMixin, SingleActionsMixin, ColumnsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('system.text_159'), key: 'detail' },
        { label: this.$t('system.text_174'), key: 'quota' },
        { label: this.$t('system.text_6'), key: 'user-list' },
        { label: this.$t('system.text_9'), key: 'project-list' },
        { label: this.$t('system.text_10'), key: 'role-list' },
        { label: this.$t('system.text_50'), key: 'cloudaccount-list' },
        { label: this.$t('system.text_17'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    ...mapGetters(['l3PermissionEnable', 'globalConfig']),
    getParams () {
      const obj = {}
      if (this.params.windowData.currentTab === 'role-list') {
        obj.filter = `domain_id.equals("${this.data.id}")`
      }
      if (['project-list', 'cloudaccount-list', 'user-list'].indexOf(this.params.windowData.currentTab) > -1) {
        obj.project_domains = [this.data.id]
      }
      return obj
    },
    isAllowCreate () {
      if (this.params.windowData.currentTab === 'role-list') {
        return true
      }
      return false
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForDomainSidePage'
        case 'user-list':
          return 'UserListForDomainSidePage'
        case 'project-list':
          return 'ProjectListForDomainSidePage'
        case 'role-list':
          return 'RoleListForDomainSidePage'
        case 'cloudaccount-list':
          return 'CloudaccountListForDomainSidePage'
        default:
          return ''
      }
    },
  },
  created () {
    if (!this.l3PermissionEnable || !this.globalConfig.enable_quota_check) {
      this.detailTabs.splice(1, 1)
    }
    if (this.params.tab) {
      this.handleTabChange(this.params.tab)
    } else {
      if (R.isNil(R.find(R.propEq('key', this.params.windowData.currentTab))(this.detailTabs))) {
        this.handleTabChange(this.detailTabs[0].key)
      }
    }
  },
}
</script>
