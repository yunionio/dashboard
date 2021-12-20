<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="title"
    icon="res-commonalert"
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
      :serverColumns="columns" />
  </base-side-page>
</template>

<script>
import CommonalertList from '@Monitor/views/commonalert/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import VmInstanceMonitorSidepage from './Monitor'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'MonitorResourceSidePage',
  components: {
    CommonalertList,
    VmInstanceMonitorSidepage,
    Actions,
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
        case 'event-drawer':
          return 'EventListForHostSidePage'
        case 'CommonalertList':
          return 'CommonalertListSidePage'
        case 'vm-instance-monitor-sidepage':
          return 'VmInstanceMonitorSidepage'
        default:
          return ''
      }
    },
    detailTabs () {
      const tabs = [
        { label: this.$t('monitor.text_122'), key: 'vm-instance-monitor-sidepage' },
        { label: this.$t('dictionary.commonalert'), key: 'CommonalertList' },
        { label: this.$t('dictionary.actions'), key: 'event-drawer' },
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
      } catch (e) {}
    },
    listParams () {
      let params = {}
      if (typeof this.getParams === 'function') {
        params = this.getParams()
      } else {
        params = this.getParams || {}
      }
      return {
        ...params,
        res_type: this.detailData.res_type,
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
      } catch (e) {}
    },
  },
}
</script>

<style scoped>

</style>
