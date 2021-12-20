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
      :data="componentData"
      :id="listId"
      :res-id="data.id"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns"
      :isPageDestroyed="isPageDestroyed"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import BaremetalDetail from './Detail'
import NetworkListForBaremetalSidepage from './Network'
import DiskListForBaremetalSidepage from './Disk'
import BaremetalMonitorSidepage from './Monitor'
// import BaremetalAlertSidepage from './Alert'

export default {
  name: 'BaremetalSidePage',
  components: {
    Actions,
    BaremetalDetail,
    NetworkListForBaremetalSidepage,
    DiskListForBaremetalSidepage,
    // BaremetalAlertSidepage,
    BaremetalMonitorSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'baremetal-detail' },
        { label: this.$t('compute.text_104'), key: 'network-list-for-baremetal-sidepage' },
        { label: this.$t('compute.text_376'), key: 'disk-list-for-baremetal-sidepage' },
        { label: this.$t('compute.text_608'), key: 'baremetal-monitor-sidepage' },
        // { label: '报警', key: 'baremetal-alert-sidepage' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
      agent_status: '',
      agent_fail_reason: '',
      agent_fail_code: '',
      isPageDestroyed: false,
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
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForBaremetalSidepage'
        default:
          return ''
      }
    },
    componentData () {
      return Object.assign({}, this.detailData, { agent_status: this.agent_status, agent_fail_reason: this.agent_fail_reason, agent_fail_code: this.agent_fail_code })
    },
  },
  created () {
    this.$bus.$on('agentStatusQuery', (val) => {
      if (this.agent_status === 'failed') {
        this.agent_status = 'applying'
      }
      this.handleInstallTask({
        script_apply_id: val,
      })
    })
  },
  beforeDestroy () {
    this.isPageDestroyed = true
  },
  methods: {
    async fetchDataCallback () {
      try {
        if (!this.data.data) return
        const { data: { data = [] } } = await new this.$Manager('scriptapplyrecords').list({ params: { server_id: this.data.data.id, details: false, limit: 1 } })
        if (data[0]) {
          this.agent_status = data[0].status
          if (data[0].status === 'applying') {
            this.handleInstallTask({
              server_id: this.componentData.id,
              details: false,
              limit: 1,
            })
          } else if (data[0].status === 'failed') {
            this.agent_fail_reason = data[0].reason
            this.agent_fail_code = data[0].fail_code || ''
          }
        }
      } catch (e) {}
    },
    async handleInstallTask (params) {
      try {
        let maxTry = 60
        while (maxTry > 0) {
          if (this.isPageDestroyed) {
            break
          }
          const { data: { data = [] } } = await new this.$Manager('scriptapplyrecords').list({ params })
          if (data[0]) {
            if (data[0].status === 'succeed' || data[0].status === 'failed') {
              this.agent_status = data[0].status
              this.agent_fail_reason = data[0].reason
              this.agent_fail_code = data[0].fail_code || ''
              break
            }
          }
          maxTry -= 1
          await new Promise(resolve => setTimeout(resolve, 6000))
        }
      } catch (e) {}
    },
  },
}
</script>
