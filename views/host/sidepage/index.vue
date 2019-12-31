<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="宿主机"
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
import VminstanceList from '@Compute/views/vminstance/components/List'
import HostDetail from './Detail'
import Dashboard from './Dashboard'
// import Alert from './Alert'
import NetworkList from './Network'
import StorageList from './Storage'
import GpuList from './Gpu'
import Monitor from './Monitor'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'HostSidePage',
  components: {
    HostDetail,
    Dashboard,
    // Alert,
    VminstanceList,
    NetworkList,
    StorageList,
    GpuList,
    Actions,
    Monitor,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'host-detail' },
        { label: '资源统计', key: 'dashboard' },
        { label: '虚拟机', key: 'vminstance-list' },
        { label: '网络', key: 'network-list' },
        { label: '存储', key: 'storage-list' },
        { label: 'GPU卡', key: 'gpu-list' },
        { label: '监控', key: 'monitor' },
        // { label: '报警', key: 'alert' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'vminstance-list') {
        return {
          host: this.params.resId,
        }
      } else if (this.params.windowData.currentTab === 'storage-list') {
        return {
          details: true,
          with_meta: true,
          limit: 20,
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
