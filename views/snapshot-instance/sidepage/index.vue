<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_102')"
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
        { label: this.$t('compute.text_238'), key: 'snapshot-detail' },
        { label: this.$t('table.title.sub_snapshot'), key: 'sub-snapshot-detail' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
}
</script>
