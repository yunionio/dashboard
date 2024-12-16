<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_461')"
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
      :res-id="data.id"
      :id="listId"
      taskResource="compute-tasks"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import SnapshotPolicyDetail from './Detail'
import SnapshotPolicyDisk from './Disk'

export default {
  name: 'SnapshotPolicySidePage',
  components: {
    SnapshotPolicyDetail,
    SnapshotPolicyDisk,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'snapshot-policy-detail' },
        { label: this.$t('compute.text_1084'), key: 'snapshot-policy-disk' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForSnapshotPolicySidePage'
        default:
          return ''
      }
    },
  },
}
</script>
