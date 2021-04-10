<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_19')"
    icon="res-schedpolicy"
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
      :id="listId"
      :on-manager="onManager"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @single-refresh="singleRefresh" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import SchedpolicyDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'SchedpolicySidePage',
  components: {
    Actions,
    SchedpolicyDetail,
  },
  mixins: [WindowsMixin, SidePageMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.text_237'), key: 'schedpolicy-detail' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForSchedpolicySidePage'
        default:
          return ''
      }
    },
  },
}
</script>
