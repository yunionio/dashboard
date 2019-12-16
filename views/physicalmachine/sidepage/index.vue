<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="物理机"
    icon="res-host"
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
import BaremetalList from '../../baremetal/components/List'
import StorageList from '../../host/sidepage/Storage'
import GpuList from '../../host/sidepage/Gpu'
import PhysicalmachineDetail from './Detail'
import NetworkList from './Network'
import BmcLog from './BMCLog'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'PhysicalmachineSidePage',
  components: {
    PhysicalmachineDetail,
    BaremetalList,
    NetworkList,
    StorageList,
    GpuList,
    BmcLog,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'physicalmachine-detail' },
        { label: '裸金属服务器', key: 'baremetal-list' },
        { label: '网络', key: 'network-list' },
        { label: '存储', key: 'storage-list' },
        { label: 'GPU卡', key: 'gpu-list' },
        { label: '硬件日志', key: 'bmc-log' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'baremetal-list') {
        return {
          host: this.params.resId,
        }
      } else if (this.params.windowData.currentTab === 'storage-list') {
        return {
          details: true,
          with_meta: true,
          limit: 20,
        }
      } else if (this.params.windowData.currentTab === 'bmc-log') {
        return {
          host_id: this.params.resId,
        }
      }
      return null
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
