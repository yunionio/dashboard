<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.text_19')"
    icon="res-cluster"
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
      :id="listId"
      :res-id="detailData.id"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import LoadbalancerclusterDetail from './Detail'
import AgentList from '@Network/views/agent/components/List'
import LbList from '@Network/views/lb/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'LoadbalancerclusterSidePage',
  components: {
    LoadbalancerclusterDetail,
    Actions,
    AgentList,
    LbList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('network.text_67'), key: 'Loadbalancercluster-detail' },
        { label: this.$t('network.text_20'), key: 'agent-list' },
        { label: this.$t('network.text_303'), key: 'lb-list' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        cluster: this.detailData.id,
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForLoadbalancerclusterSidePage'
        case 'agent-list':
          return 'AgentListForLoadbalancerclusterSidePage'
        case 'lb-list':
          return 'LbListForLoadbalancerclusterSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
