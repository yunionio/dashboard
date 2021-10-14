<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.project')"
    icon="res-project"
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
      :on-manager="onManager"
      :columns="columns"
      @refresh="refresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import { mapGetters } from 'vuex'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import ProjectDetail from './Detail'
import ProjectDirectlyUnderUserList from './DirectlyUnderUserList'
// import ProjectResourcesStatistics from './ResourcesStatistics'
import Quota from './Quota'

export default {
  name: 'ProjectSidePage',
  components: {
    ProjectDetail,
    Actions,
    ProjectDirectlyUnderUserList,
    // ProjectResourcesStatistics,
    Quota,
  },
  mixins: [SidePageMixin, WindowsMixin, SingleActionsMixin, ColumnsMixin],
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['globalConfig']),
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForProjectSidePage'
        case 'project-directly-under-user-list':
          return 'DirectlyUnderUserListForProjectSidePage'
        default:
          return ''
      }
    },
    detailTabs () {
      const detailTabs = [
        { label: this.$t('system.text_159'), key: 'project-detail' },
        { label: this.$t('common_492'), key: 'project-directly-under-user-list' },
        { label: this.$t('system.text_174'), key: 'quota' },
        // { label: this.$t('system.text_173'), key: 'project-resources-statistics' },
        { label: this.$t('system.text_17'), key: 'event-drawer' },
      ]
      if (!this.globalConfig.enable_quota_check) {
        detailTabs.splice(2, 1)
      }
      return detailTabs
    },
  },
  created () {
    if (this.params.tab) this.handleTabChange(this.params.tab)
  },
}
</script>
