<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="二层网络"
    icon="res-wire"
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
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import NetworkList from '../../network/components/List'
import WireDetail from './Detail'
import BaremetalsList from './Baremetals'
import HostsList from './Hosts'
import Dashboard from './Dashboard'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'WireSidePage',
  components: {
    WireDetail,
    BaremetalsList,
    HostsList,
    Dashboard,
    Actions,
    NetworkList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'wire-detail' },
        { label: 'IP子网', key: 'network-list' },
        { label: '物理机', key: 'baremetals-list' },
        { label: '宿主机', key: 'hosts-list' },
        { label: '资源统计', key: 'dashboarde' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'network-list') {
        return {
          width_meta: true,
          wire: this.detailData.id,
          details: true,
        }
      }
      return null
    },
  },
}
</script>
