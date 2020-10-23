<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_92')"
    icon="res-baremetal"
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
      :data="detailData"
      :res-id="data.id"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns"
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
import BaremetalDetail from './Detail'
import NetworkListForBaremetalSidepage from './Network'
import DiskListForBaremetalSidepage from './Disk'
// import BaremetalMonitorSidepage from './Monitor'
// import BaremetalAlertSidepage from './Alert'
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
    // BaremetalAlertSidepage,
    // BaremetalMonitorSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'baremetal-detail' },
        { label: this.$t('compute.text_104'), key: 'network-list-for-baremetal-sidepage' },
        { label: this.$t('compute.text_376'), key: 'disk-list-for-baremetal-sidepage' },
        // { label: '监控', key: 'baremetal-monitor-sidepage' },
        // { label: '报警', key: 'baremetal-alert-sidepage' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
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
