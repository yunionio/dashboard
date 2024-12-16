<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_101')"
    icon="res-disk-snapshot"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions v-if="showActions">
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :data="detailData"
      :res-id="data.id"
      :id="listId"
      :on-manager="onManager"
      :columns="columns"
      taskResource="compute-tasks" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import SnapshotDetail from './Detail'

export default {
  name: 'SnapshotSidePage',
  components: {
    SnapshotDetail,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'snapshot-detail' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForSnapshotSidePage'
        default:
          return ''
      }
    },
    showActions () {
      return !this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.perform_action')
    },
  },
}
</script>
