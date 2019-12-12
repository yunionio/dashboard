<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="快照策略"
    icon="res-kuaizhaocelue"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :data="data" :res-id="params.resId" :list="params.list" />
  </base-side-page>
</template>

<script>
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
  mixins: [SidePageMixin, WindowsMixin],
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
  computed: {
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
