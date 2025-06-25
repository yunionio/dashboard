<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_431')"
    icon="res-scheduledtask"
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
      :data="detailData"
      :res-id="data.id"
      :on-manager="onManager"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ScheduledtaskDetail from './Detail'
import RelatedResource from './RelatedResource'
import TaskHistory from './TaskHistory'

export default {
  name: 'ScheduledtaskSidePage',
  components: {
    Actions,
    ScheduledtaskDetail,
    RelatedResource,
    TaskHistory,
  },
  mixins: [WindowsMixin, SidePageMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {}
  },
  computed: {
    detailTabs () {
      const tabs = [
        { label: this.$t('cloudenv.text_237'), key: 'scheduledtask-detail' },
        { label: this.$t('cloudenv.text_464'), key: 'task-history' },
        { label: this.$t('cloudenv.text_454'), key: 'related-resource' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ]
      return tabs
    },
  },
}
</script>
