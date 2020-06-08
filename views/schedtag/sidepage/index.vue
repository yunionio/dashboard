<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="调度标签"
    icon="res-schedtag"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :data="detailData" :on-manager="onManager" :res-id="data.id" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import SchedtagDetail from './Detail'
import Dashboard from './Dashboard'
import HostList from '@Compute/views/host/components/List'
import PhysicalmachineList from '@Compute/views/physicalmachine/components/List'
import storageList from '@Storage/views/blockstorage/components/List'
import networkList from '@Network/views/network/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'SchedtagSidePage',
  components: {
    Actions,
    SchedtagDetail,
    HostList,
    Dashboard,
    PhysicalmachineList,
    storageList,
    networkList,
  },
  mixins: [SidePageMixin, WindowsMixin, SingleActionsMixin, ColumnsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'schedtag-detail' },
        { label: '物理机', key: 'physicalmachine-list' },
        { label: '宿主机', key: 'host-list' },
        { label: '存储', key: 'storage-list' },
        { label: '网络', key: 'network-list' },
        { label: '资源统计', key: 'dashboard' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      const params = {
        'physicalmachine-list': {
          details: true,
          schedtag: this.data.id,
          baremetal: true,
        },
        'host-list': {
          detail: true,
          schedtag: this.data.id,
          baremetal: false,
        },
      }
      return params[this.params.windowData.currentTab] || {
        details: true,
        schedtag: this.data.id,
      }
    },
  },
}
</script>
