<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="title"
    icon="res-commonalerts"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        button-type="link"
        button-size="small" />
    </template>
    <component
      needFetchResource
      :is="params.windowData.currentTab"
      :listId="listId"
      :id="listId"
      :resId="data.id"
      :data="componentData"
      :resource="resource"
      :resType="resType"
      :on-manager="onManager"
      :getParams="listParams"
      :isPageDestroyed="isPageDestroyed"
      :serverColumns="columns"
      hideAlertRecordResourceCount />
  </base-side-page>
</template>

<script>
import CommonalertList from '@Monitor/views/commonalert/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import AlertrecortList from '@Monitor/views/alertrecord/components/List'
// import VmInstanceMonitorSidepage from './Monitor'
import VmInstanceMonitorSidepage from '@Compute/views/vminstance/sidepage/Monitor'
import HostMonitorSidepage from '@Compute/views/host/sidepage/Monitor'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'MonitorResourceSidePage',
  components: {
    CommonalertList,
    VmInstanceMonitorSidepage,
    HostMonitorSidepage,
    Actions,
    AlertrecortList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      agent_status: '',
      agent_fail_reason: '',
      agent_fail_code: '',
      isPageDestroyed: false,
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'CommonalertList':
          return 'CommonalertListSidePage'
        case 'vm-instance-monitor-sidepage':
          return 'VmInstanceMonitorSidepage'
        case 'host-monitor-sidepage':
          return 'HostMonitorSidepage'
        case 'AlertrecortList':
          return 'AlertrecortListSidePage'
        default:
          return ''
      }
    },
    detailTabs () {
      const tabs = [
        { label: this.$t('monitor.text_10'), key: 'AlertrecortList' },
        { label: this.$t('monitor.text_122'), key: this.resType === 'guest' ? 'vm-instance-monitor-sidepage' : 'host-monitor-sidepage' },
        { label: this.$t('dictionary.commonalert'), key: 'CommonalertList' },
      ]
      return tabs
    },
    title () {
      const t = this.params.res_type || ''
      return t === 'guest' ? this.$t('common.server') : this.$t('dictionary.host')
    },
    resType () {
      return this.params.res_type
    },
    componentData () {
      const data = Object.assign({}, this.detailData, { agent_status: this.agent_status, agent_fail_reason: this.agent_fail_reason, agent_fail_code: this.agent_fail_code })
      if (this.params.windowData.currentTab === 'vm-instance-monitor-sidepage' || this.params.windowData.currentTab === 'host-monitor-sidepage') {
        data.id = data.res_id || data.id
      }
      return data
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
      if (this.params.res_type !== 'guest') return
      try {
        if (!this.data.data) return
        const { data: { data = [] } } = await new this.$Manager('scriptapplyrecords').list({ params: { server_id: this.data.data.res_id, details: false, limit: 1 } })
        if (data[0]) {
          this.agent_status = data[0].status
          if (data[0].status === 'applying') {
            this.handleInstallTask({
              server_id: this.componentData.res_id,
              details: false,
              limit: 1,
            })
          } else if (data[0].status === 'failed') {
            this.agent_fail_reason = data[0].reason
            this.agent_fail_code = data[0].fail_code || ''
          }
        }
      } catch (e) { }
    },
    listParams () {
      let params = {}
      if (typeof this.getParams === 'function') {
        params = this.getParams()
      } else {
        params = this.getParams || {}
      }
      if (this.params.windowData.currentTab === 'AlertrecortList') {
        return {
          res_id: this.detailData.res_id,
        }
      }
      if (this.params.windowData.currentTab === 'CommonalertList') {
        params.monitor_resource_id = this.detailData.res_id
      }
      return {
        ...params,
      }
    },
    handleOpenSidepage (row, tab) {
      this.params.windowData.currentTab = tab
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
      } catch (e) { }
    },
  },
}
</script>

<style scoped>
</style>
