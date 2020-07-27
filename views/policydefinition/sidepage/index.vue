<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_21')"
    icon="res-policydefinition"
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
      @single-refresh="singleRefresh" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import PolicydefinitionDetail from './Detail'
import PolicyassignmentsList from './Policyassignments'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'PolicydefinitionSidePage',
  components: {
    Actions,
    PolicydefinitionDetail,
    PolicyassignmentsList,
  },
  mixins: [WindowsMixin, SidePageMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.text_237'), key: 'policydefinition-detail' },
        { label: this.$t('cloudenv.text_393'), key: 'policyassignments-list' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
    }
  },
}
</script>
