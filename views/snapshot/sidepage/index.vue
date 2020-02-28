<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="title"
    :icon="icon"
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
      :res-id="data.id"
      :on-manager="onManager"
      :type="params.type" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
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
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      mixinType: this.params.type,
    }
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
