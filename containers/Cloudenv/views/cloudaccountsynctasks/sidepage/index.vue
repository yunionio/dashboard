<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.account_sync_tasks')"
    icon="res-cloudaccount"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :on-manager="onManager"
      :getParams="getParams" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import CloudaccountSyncTaskDetail from './Detail'
import CloudaccountSyncTaskChildren from './Children'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'CloudaccountSyncTaskSidePage',
  components: {
    // 显式注册 kebab 名，保证 :is="currentTab" 能命中
    'cloudaccount-sync-task-detail': CloudaccountSyncTaskDetail,
    'cloudaccount-sync-task-children': CloudaccountSyncTaskChildren,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  computed: {
    detailTabs () {
      const tabs = []
      // L1/L2：只展示子任务列表，不再提供「账号同步任务」详情页
      if (this.detailData.level !== 'region') {
        tabs.push({ label: this.$t('cloudenv.sync_task.children'), key: 'cloudaccount-sync-task-children' })
      } else {
        // L3 叶子无子任务，保留详情
        tabs.push({ label: this.$t('cloudenv.account_sync_tasks'), key: 'cloudaccount-sync-task-detail' })
      }
      tabs.push({ label: this.$t('compute.text_240'), key: 'event-drawer' })
      return tabs
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForCloudaccountSyncTasksSidePage'
        default:
          return ''
      }
    },
  },
  watch: {
    // detail 异步加载后，确保 L1/L2 落在子任务列表
    'detailData.level' (level) {
      if (!level) return
      this.ensureDefaultTab()
    },
  },
  created () {
    this.ensureDefaultTab()
  },
  methods: {
    ensureDefaultTab () {
      const tabs = this.detailTabs.map(t => t.key)
      const preferred = this.params.tab
      if (preferred && tabs.includes(preferred)) {
        this.handleTabChange(preferred)
        return
      }
      const cur = this.params.windowData && this.params.windowData.currentTab
      if (cur && tabs.includes(cur)) return
      // L1/L2 默认子任务列表；L3 默认详情
      const fallback = tabs.includes('cloudaccount-sync-task-children')
        ? 'cloudaccount-sync-task-children'
        : (tabs.includes('cloudaccount-sync-task-detail') ? 'cloudaccount-sync-task-detail' : tabs[0])
      if (fallback) this.handleTabChange(fallback)
    },
  },
}
</script>
