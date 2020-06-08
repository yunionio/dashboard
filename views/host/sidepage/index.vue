<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="宿主机"
    icon="res-host"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="data.id" :data="detailData" :columns="columns" :on-manager="onManager" :refresh="refresh" :getParams="getParams"  @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import HostDetail from './Detail'
import Dashboard from './Dashboard'
// import Alert from './Alert'
import NetworkList from './Network'
import StorageList from './Storage'
import GpuList from './Gpu'
import Monitor from './Monitor'
import ServerRecovery from '@Compute/views/server-recovery/components/List'
import VminstanceList from '@Compute/views/vminstance/components/List'
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
    ServerRecovery,
    Actions,
    Monitor,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'host-detail' },
        { label: '资源统计', key: 'dashboard' },
        { label: '虚拟机', key: 'vminstance-list' },
        { label: '网络', key: 'network-list' },
        { label: '存储', key: 'storage-list' },
        { label: 'GPU卡', key: 'gpu-list' },
        { label: '回收站', key: 'server-recovery' },
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
          host: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'storage-list') {
        return {
          details: true,
          with_meta: true,
          limit: 20,
        }
      } else if (this.params.windowData.currentTab === 'server-recovery') {
        return {
          host: this.data.id,
        }
      }
      return null
    },
  },
}
</script>
