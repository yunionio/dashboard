<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="快照策略"
    icon="res-kuaizhaocelue"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :data="detailData"
      :on-manager="onManager"
      :res-id="data.id" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import SnapshotPolicyDetail from './Detail'
import SnapshotPolicyDisk from './Disk'
import SnapshotPolicyCache from './Cache'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'SnapshotPolicySidePage',
  components: {
    SnapshotPolicyDetail,
    SnapshotPolicyDisk,
    SnapshotPolicyCache,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'snapshot-policy-detail' },
        { label: '关联硬盘', key: 'snapshot-policy-disk' },
        { label: '缓存列表', key: 'snapshot-policy-cache' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
}
</script>
