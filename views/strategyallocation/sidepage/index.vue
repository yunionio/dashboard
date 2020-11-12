<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_500')"
    icon="res-strategy"
    :res-name="detailData.policy_name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :on-manager="onManager"
      :getParams="getParams"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @single-refresh="singleRefresh" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import StrategyAllocationDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'StrategyAllocationSidePage',
  components: {
    Actions,
    StrategyAllocationDetail,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.text_237'), key: 'strategy-allocation-detail' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForStrategyAllocationSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
