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
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'
import SnapshotPolicyDisk from './Disk'
import SnapshotPolicyServer from './Server'
export default {
  name: 'SnapshotPolicySidePage',
  components: {
    Detail,
    SnapshotPolicyDisk,
    SnapshotPolicyServer,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
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
    detailTabs () {
      const list = [
        { label: this.$t('compute.text_238'), key: 'detail' },
        { label: this.$t('compute.text_1084'), key: 'snapshot-policy-disk' },
        { label: this.$t('compute.bind_server'), key: 'snapshot-policy-server' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ]
      if (this.detailData.type === 'server') {
        return list.filter(item => item.key !== 'snapshot-policy-disk')
      }
      if (this.detailData.type === 'disk') {
        return list.filter(item => item.key !== 'snapshot-policy-server')
      }
      return list
    },
  },
}
</script>
