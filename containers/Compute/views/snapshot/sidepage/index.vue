<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="title"
    :icon="icon"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :data="data"
      :res-id="params.resId"
      :list="params.list"
      :type="params.type" />
  </base-side-page>
</template>

<script>
import SnapshotDetail from './Detail'
import SubSnapshotDetail from './SubSnapshotDetail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'SnapshotSidePage',
  components: {
    SnapshotDetail,
    SubSnapshotDetail,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {}
  },
  computed: {
    isDiskSnapshot () {
      return this.params.type === 'disk'
    },
    isInstanceSnapshot () {
      return this.params.type === 'instance'
    },
    title () {
      return this.isDiskSnapshot ? '硬盘快照' : '主机快照'
    },
    icon () {
      return this.isDiskSnapshot ? 'res-disk-snapshot' : 'res-instance-snapshot'
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
    detailTabs () {
      if (this.isDiskSnapshot) {
        return [
          { label: '详情', key: 'snapshot-detail' },
          { label: '操作日志', key: 'event-drawer' },
        ]
      }
      return [
        { label: '详情', key: 'snapshot-detail' },
        { label: '子快照', key: 'sub-snapshot-detail' },
        { label: '操作日志', key: 'event-drawer' },
      ]
    },
  },
}
</script>
