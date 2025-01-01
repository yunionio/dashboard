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

export default {
  name: 'UserSidePage',
  components: {
    'user-detail': UserDetail,
    Projects,
    Group,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('system.text_159'), key: 'user-detail' },
        { label: this.$t('common_494'), key: 'projects' },
        { label: this.$t('common_495'), key: 'Group' },
        { label: this.$t('system.text_17'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForUserSidePage'
        case 'projects':
          return 'ProjectsListForUserSidePage'
        case 'Group':
          return 'GroupListForUserSidePage'
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
