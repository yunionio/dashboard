<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.text_565')"
    icon="res-network"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions v-if="showActions">
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
      taskResource="compute-tasks"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange"
      @updateDetail="handleUpdateDetail" />
  </base-side-page>
</template>

<script>
import ReservedIpList from '@Network/views/reserved-ip/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import NetworkDetail from './Detail'
import HostMachineip from './HostMachineIp'
import HostIp from './HostIp'
import LbIp from './LbIp'
import FlexIp from './FlexIp'
import IPList from './IPList'
import NetworkIpMacs from './NetworkIpMacs'

export default {
  name: 'NetworkSidePage',
  components: {
    NetworkDetail,
    HostMachineip,
    HostIp,
    ReservedIpList,
    LbIp,
    FlexIp,
    Actions,
    IPList,
    NetworkIpMacs,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('network.text_67'), key: 'network-detail' },
        { label: this.$t('network.text_669'), key: 'i-p-list' },
        // { label: '宿主机IP', key: 'host-machineip' },
        // { label: '主机IP', key: 'host-ip' },
        { label: this.$t('network.text_651'), key: 'reserved-ip-list' },
        { label: this.$t('network.mac_ip.mac_mapping_table'), key: 'network-ip-macs' },
        // { label: '负载均衡IP', key: 'lb-ip' },
        // { label: '弹性网卡IP', key: 'flex-ip' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'reserved-ip-list') {
        return {
          network: this.detailData.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForNetworkSidePage'
        case 'i-p-list':
          return 'IPListForNetworkSidePage'
        case 'reserved-ip-list':
          return 'ReservedIpListForNetworkSidePage'
        case 'hosts-list':
          return 'HostsListForNetworkSidePage'
        default:
          return ''
      }
    },
    hiddenActions () {
      return this.params.hiddenActions || []
    },
    hiddenColumns () {
      return this.params.hiddenColumns || []
    },
    showActions () {
      return !this.$isScopedPolicyMenuHidden('network_hidden_columns.perform_action')
    },
  },
  methods: {
    handleUpdateDetail () {
      this.fetchData()
    },
  },
}
</script>
