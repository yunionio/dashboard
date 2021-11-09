<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.vpc_network')"
    icon="res-vpc-network"
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
import Vpc from './Vpc'
import RouteSet from './RouteSet'

export default {
  name: 'VpcNetworkSidePage',
  components: {
    Detail,
    Vpc,
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
        { label: 'VPC', key: 'vpc' },
        { label: '路由', key: 'route-set' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ]
      return tabs
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
}
</script>
