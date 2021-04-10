<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.text_138')"
    icon="res-lblistener"
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
      :res-id="detailData.id"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      :lbData="params.options.lbData"
      :isListenerSidepage="true"
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
import LoadbalancerlistenerDetail from './Detail'
import LoadbalancerlistenerDashboard from './dashboard'
import LoadbalancerlistenerruleList from '@Network/views/loadbalancerlistenerrule/components/List'
import LoadbalancerbackendList from '@Network/views/loadbalancerbackend/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'LoadbalancerlistenerSidePage',
  components: {
    LoadbalancerlistenerDetail,
    Actions,
    LoadbalancerbackendList,
    LoadbalancerlistenerruleList,
    LoadbalancerlistenerDashboard,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  computed: {
    detailTabs () {
      const ruleItem = { label: this.$t('network.text_141'), key: 'loadbalancerlistenerrule-list' }
      const dashboardItem = { label: this.$t('network.text_520'), key: 'loadbalancerlistener-dashboard' }
      const rules = [
        { label: this.$t('network.text_67'), key: 'loadbalancerlistener-detail' },
        { label: this.$t('network.text_140'), key: 'loadbalancerbackend-list' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ]
      if (this.detailData.redirect === 'raw') {
        rules.splice(1, 1)
      }
      if (this.params.options.rowData.listener_type === 'http' || this.params.options.rowData.listener_type === 'https') {
        rules.splice(1, 0, ruleItem)
      }
      if (this.params.options.rowData.provider === 'OneCloud') {
        rules.splice(2, 0, dashboardItem)
      }
      return rules
    },
    getParams () {
      if (this.params.windowData.currentTab === 'loadbalancerbackend-list') {
        return {
          backend_group: this.detailData.backend_group_id,
          details: true,
          scope: this.$store.getters.scope,
        }
      }
      if (this.params.windowData.currentTab === 'loadbalancerlistenerrule-list') {
        return {
          listener: this.detailData.id,
          details: true,
          scope: this.$store.getters.scope,
        }
      }
      return null
    },
  },
}
</script>
