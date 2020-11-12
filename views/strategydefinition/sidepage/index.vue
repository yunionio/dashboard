<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_501')"
    icon="res-strategy"
    :res-name="detailData.name"
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
import StrategyDefinitionDetail from './Detail'
import StrategyAllocationList from '@Cloudenv/views/strategyallocation/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'StrategyDefinitionSidePage',
  components: {
    Actions,
    StrategyDefinitionDetail,
    StrategyAllocationList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.text_237'), key: 'strategy-definition-detail' },
        { label: this.$t('cloudenv.text_503'), key: 'strategy-allocation-list' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'strategy-allocation-list') {
        return {
          policy_id: this.data.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForStrategyDefinitionSidePage'
        case 'strategy-allocation-list':
          return 'StrategyAllocationListForStrategyDefinitionSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
