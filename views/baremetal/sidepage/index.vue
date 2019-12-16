<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="裸金属"
    icon="res-baremetal"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :data="data"
      :list="params.list"
      :res-id="params.resId"
      :getParams="getParams"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import BaremetalDetail from './Detail'
import NetworkListForBaremetalSidepage from './Network'
import DiskListForBaremetalSidepage from './Disk'
import BaremetalMonitorSidepage from './Monitor'
import BaremetalAlertSidepage from './Alert'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'BaremetalSidePage',
  components: {
    Actions,
    BaremetalDetail,
    NetworkListForBaremetalSidepage,
    DiskListForBaremetalSidepage,
    BaremetalAlertSidepage,
    BaremetalMonitorSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'baremetal-detail' },
        { label: '网络', key: 'network-list-for-baremetal-sidepage' },
        { label: '磁盘', key: 'disk-list-for-baremetal-sidepage' },
        { label: '监控', key: 'baremetal-monitor-sidepage' },
        { label: '报警', key: 'baremetal-alert-sidepage' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    data () {
      return this.params.list.data[this.params.resId].data
    },
    getParams () {
      if (this.params.windowData.currentTab === 'network-list-for-baremetal-sidepage') {
        return {
          details: true,
          with_meta: true,
        }
      }
      if (this.params.windowData.currentTab === 'disk-list-for-baremetal-sidepage') {
        return {
          details: true,
          with_meta: true,
        }
      }
      return null
    },
  },
}
</script>
