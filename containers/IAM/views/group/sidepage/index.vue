<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.group')"
    icon="res-group"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="data.id" :id="listId" :data="detailData" :onManager="onManager" :getParams="getParams" @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import GroupDetail from './Detail'
import ProjectList from './ProjectList'
import UserList from './UserList'

export default {
  name: 'GroupSidePage',
  components: {
    GroupDetail,
    Actions,
    ProjectList,
    UserList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('system.text_159'), key: 'group-detail' },
        { label: this.$t('system.text_201'), key: 'project-list' },
        { label: this.$t('system.user_in_group'), key: 'user-list' },
        { label: this.$t('system.text_17'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForGroupSidePage'
        case 'project-list':
          return 'ProjectListForGroupSidePage'
        case 'user-list':
          return 'UserListForGroupSidePage'
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
