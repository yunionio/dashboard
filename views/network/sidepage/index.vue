<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="IP子网"
    icon="res-network"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="params.resId" :data="data" :list="params.list" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import NetworkDetail from './Detail'
import HostMachineip from './HostMachineIp'
import HostIp from './HostIp'
import ReservedIp from './ReservedIp'
import LbIp from './LbIp'
import FlexIp from './FlexIp'
import IPList from './IPList'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'NetworkSidePage',
  components: {
    NetworkDetail,
    HostMachineip,
    HostIp,
    ReservedIp,
    LbIp,
    FlexIp,
    Actions,
    IPList,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'network-detail' },
        { label: 'IP使用情况', key: 'i-p-list' },
        // { label: '宿主机IP', key: 'host-machineip' },
        // { label: '主机IP', key: 'host-ip' },
        // { label: '预留IP', key: 'reserved-ip' },
        // { label: '负载均衡IP', key: 'lb-ip' },
        // { label: '弹性网卡IP', key: 'flex-ip' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return null
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
