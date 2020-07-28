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
      :res-id="detailData.id"
      :showGroupActions="showGroupActions"
      :showSearchbox="showSearchbox"
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
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import NetworkList from '../../network/components/List'
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
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'vpc-detail' },
        { label: 'IP子网', key: 'network-list' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
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
      if (this.params.windowData.currentTab === 'network-list') {
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
  },
}
</script>
