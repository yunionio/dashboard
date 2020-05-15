<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="主机快照"
    icon="res-instance-snapshot"
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
      @tab-change="handleTabChange" />
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
  name: 'SnapshotInstanceSidePage',
  components: {
    SnapshotDetail,
    SubSnapshotDetail,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'snapshot-detail' },
        { label: '子快照', key: 'sub-snapshot-detail' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
}
</script>
