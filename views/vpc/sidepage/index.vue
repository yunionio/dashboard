<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.vpc')"
    icon="res-vpc"
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
import RouteTableList from './RouteTable'
import NetworkList from './Network'
import VpcDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'VpcSidePage',
  components: {
    VpcDetail,
    NetworkList,
    Actions,
    RouteTableList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
    }
  },
  computed: {
    detailTabs () {
      const tabs = [
        { label: this.$t('network.text_67'), key: 'vpc-detail' },
        { label: this.$t('network.text_565'), key: 'network-list' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ]
      if (this.detailData.brand === 'Huawei' || this.detailData.brand === 'Aliyun' || this.detailData.brand === 'OpenStack') {
        tabs.splice(2, 0, { label: this.$t('dictionary.route_table'), key: 'route-table-list' })
      }
      return tabs
    },
    getParams () {
      if (this.params.windowData.currentTab === 'network-list') {
        return {
          width_meta: true,
          vpc: this.detailData.id,
          details: true,
        }
      }
      if (this.params.windowData.currentTab === 'route-table-list') {
        return {
          vpc: this.detailData.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForVpcSidePage'
        case 'network-list':
          return 'NetworkListForVpcSidePage'
        case 'route-table-list':
          return 'RouteTableListForVpcSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
