<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.vpc_peer_connect')"
    icon="res-vpc-peerconnect"
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
      :id="listId"
      :res-id="detailData.id"
      :data="detailData"
      :on-manager="onManager"
      :columns="columns"
      :getParams="getParams"
      taskResource="compute-tasks"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'
// import Vpc from './Vpc'
import RouteSet from './RouteSet'

export default {
  name: 'VpcPeerConnectSidePage',
  components: {
    Detail,
    // Vpc,
    RouteSet,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
    }
  },
  computed: {
    detailTabs () {
      const tabs = [
        { label: this.$t('network.text_67'), key: 'detail' },
        // { label: 'VPC', key: 'vpc' },
        { label: this.$t('network.vpc_network.route'), key: 'route-set' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ]
      return tabs
    },
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForVpcSidePage'
        default:
          return ''
      }
    },
  },
  created () {
    if (this.params.tab) {
      this.handleTabChange(this.params.tab)
    }
  },
}
</script>
