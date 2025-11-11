<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_111')"
    icon="res-host"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :hostInfo="detailData"
      :columns="columns"
      :on-manager="onManager"
      :refresh="refresh"
      :getParams="getParams"
      :probeHostDevices="probeHostDevices"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import * as R from 'ramda'
// import Alert from './Alert'
import NetworkList from '@Compute/views/physicalmachine/sidepage/Network'
import ServerRecovery from '@Compute/views/server-recovery/components/List'
import GpuList from '@Compute/views/gpu/components/List'
import BmcLog from '@Compute/views/physicalmachine/sidepage/BMCLog'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import { hasPermission } from '@/utils/auth'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import HostDetail from './Detail'
import Dashboard from './Dashboard'
import StorageList from './Storage'
// import GpuList from './Gpu'
import Monitor from './Monitor'
import VminstanceList from './VminstanceList'
import Dmesg from './Dmesg'

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
    BmcLog,
    Dmesg,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  computed: {
    detailTabs () {
      let tabs = [
        { label: this.$t('compute.text_238'), key: 'host-detail' },
        { label: this.$t('compute.text_606'), key: 'dashboard' },
        { label: this.$t('compute.text_91'), key: 'vminstance-list' },
        { label: this.$t('compute.text_104'), key: 'network-list' },
        { label: this.$t('compute.text_99'), key: 'storage-list' },
        { label: this.$t('compute.text_113'), key: 'gpu-list' },
        { label: this.$t('compute.text_114'), key: 'server-recovery' },
        { label: this.$t('compute.text_608'), key: 'monitor' },
        // { label: '报警', key: 'alert' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
        { label: this.$t('compute.dmesg_log'), key: 'dmesg' },
      ]
      if (!hasPermission({ key: 'baremetalnetworks_list' })) {
        tabs = R.remove(R.findIndex(R.propEq('key', 'network-list'))(tabs), 1, tabs)
      }
      if (!hasPermission({ key: 'hoststorages_list' })) {
        tabs = R.remove(R.findIndex(R.propEq('key', 'storage-list'))(tabs), 1, tabs)
      }
      if (this.data && this.data.data && this.data.data.is_baremetal) {
        tabs = R.insert(tabs.length - 1, { label: this.$t('compute.text_865'), key: 'bmc-log' }, tabs)
      }
      return tabs
    },
    probeHostDevices () {
      return this.data && this.data.data && (this.data.data.host_type === 'hypervisor' || this.data.data.host_type === 'container')
    },
    getParams () {
      if (this.params.windowData.currentTab === 'vminstance-list') {
        return {
          host: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'storage-list') {
        return {
          host_id: this.data.id,
          details: true,
          with_meta: true,
          limit: 20,
        }
      } else if (this.params.windowData.currentTab === 'server-recovery') {
        return {
          host: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'gpu-list') {
        return {
          host: this.data.id,
          // gpu: true,
        }
      } else if (this.params.windowData.currentTab === 'bmc-log') {
        return {
          host_id: this.data.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForHostSidePage'
        case 'vminstance-list':
          return 'VminstanceListForHostSidePage'
        case 'storage-list':
          return 'StorageListForHostSidePage'
        case 'gpu-list':
          return 'GpuListForHostSidePage'
        case 'server-recovery':
          return 'ServerRecoveryListForHostSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
