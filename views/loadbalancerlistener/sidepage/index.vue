<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="监听"
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
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import LoadbalancerbackendList from '@Network/views/loadbalancerbackend/components/List'
import LoadbalancerlistenerruleList from '@Network/views/loadbalancerlistenerrule/components/List'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import LoadbalancerlistenerDetail from './Detail'
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
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  // data () {
  //   return {
  //     detailTabs: [
  //       { label: '详情', key: 'loadbalancerlistener-detail' },
  //       { label: '转发策略', key: 'loadbalancerlistenerrule-list' },
  //       { label: '后端服务器', key: 'loadbalancerbackend-list' },
  //       { label: '操作日志', key: 'event-drawer' },
  //     ],
  //   }
  // },
  computed: {
    detailTabs () {
      const ruleItem = { label: '转发策略', key: 'loadbalancerlistenerrule-list' }
      const rules = [
        { label: '详情', key: 'loadbalancerlistener-detail' },
        { label: '后端服务器', key: 'loadbalancerbackend-list' },
        { label: '操作日志', key: 'event-drawer' },
      ]
      if (this.params.options.listenerType === 'http' || this.params.options.listenerType === 'https') {
        rules.splice(1, 0, ruleItem)
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
      return null
    },
  },
}
</script>
