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
    <component
      :is="params.windowData.currentTab"
      :hiddenColumns="hiddenColumns"
      :res-id="detailData.id"
      :showGroupActions="showGroupActions"
      :showSingleActions="showSingleActions"
      :showSearchbox="showSearchbox"
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
import NetworkList from '../../network/components/List'
import RouteTableList from '../../route-table/components/List'
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
    showGroupActions () {
      if (this.params.windowData.currentTab === 'network-list' || this.params.windowData.currentTab === 'route-table-list') {
        return false
      }
      return true
    },
    showSingleActions () {
      if (this.params.windowData.currentTab === 'route-table-list') {
        return false
      }
      return true
    },
    showSearchbox () {
      if (this.params.windowData.currentTab === 'network-list') {
        return false
      }
      return true
    },
    hiddenColumns () {
      if (this.params.windowData.currentTab === 'route-table-list') {
        return ['public_scope']
      }
      return []
    },
  },
}
</script>
