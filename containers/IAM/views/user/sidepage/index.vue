<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.user')"
    icon="res-user"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :onManager="onManager" :res-id="data.id" :id="listId" :data="detailData" :getParams="getParams" @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import UserDetail from './Detail'
import Projects from './Projects'
import Group from './Groups'
import ClouduserList from './ClouduserList'
import SamluserList from './SamluserList'

export default {
  name: 'UserSidePage',
  components: {
    'user-detail': UserDetail,
    Projects,
    Group,
    Actions,
    ClouduserList,
    SamluserList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('system.text_159'), key: 'user-detail' },
        { label: this.$t('common_494'), key: 'projects' },
        { label: this.$t('common_495'), key: 'Group' },
        { label: this.$t('dictionary.clouduser'), key: 'clouduser-list' },
        { label: this.$t('user.sidepage.tab.samluser'), key: 'samluser-list' },
        { label: this.$t('system.text_17'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'clouduser-list') {
        return {
          user_id: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'samluser-list') {
        return {
          user_id: this.data.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForUserSidePage'
        case 'projects':
          return 'ProjectsListForUserSidePage'
        case 'Group':
          return 'GroupListForUserSidePage'
        case 'clouduser-list':
          return 'ClouduserListForUserSidePage'
        case 'samluser-list':
          return 'SamluserListForUserSidepage'
        default:
          return ''
      }
    },
  },
  created () {
    if (this.params.tab) {
      this.handleTabChange(this.params.tab)
    }
  },
  methods: {
    handleOpenSidepage (row, tab) {
      this.handleTabChange(tab)
    },
  },
}
</script>
