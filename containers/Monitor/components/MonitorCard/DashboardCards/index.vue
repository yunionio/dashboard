<template>
  <div :class="card_style">
    <div v-if="!readOnly" class="d-flex align-items-center justify-content-between">
      <monitor-header
        :time.sync="time"
        :timeGroup.sync="timeGroup"
        :showTimegroup="true"
        :showGroupFunc="true"
        :groupFunc.sync="groupFunc"
        :customTime.sync="customTime"
        :showCustomTimeText="time==='custom'"
        :showAutoRefresh="!useLocalPanels"
        customTimeUseTimeStamp
        @refresh="handleRefresh" />
      <template v-if="!useLocalPanels">
        <a-dropdown-button
          v-if="!readOnly && panels.length > 1"
          :title="$t('monitor.dashboard.dialog.project.create')"
          class="text-truncate"
          @click="createChart"
          placement="topLeft">
          <a-icon type="plus-circle" />
          {{ $t('monitor.dashboard.dialog.project.create') }}
          <a-menu slot="overlay" @click="handleMenuClick">
            <a-menu-item key="adjust_order">
              {{ $t('monitor.adjust_chart_order') }}
            </a-menu-item>
          </a-menu>
          <a-icon slot="icon" type="down" />
        </a-dropdown-button>
        <a-button v-else style="margin-left: 8px;" icon="plus-circle" @click="createChart">
          {{ $t('monitor.dashboard.dialog.project.create')}}
        </a-button>
      </template>
    </div>
    <div :class="card_style" :style="readOnly && !selectable ? '' :'padding-top: 20px;'">
      <dashboard-card ref="dashboardCard" v-if="readOnly && !selectable" :card_style="card_style" :chartHeigth="chartHeigth" @chose_panel="chose_panel" :panel="panels.length > 0 ? panels[0] : {}" :focusPanelId="focusPanelId" :selectable="selectable" :readOnly="readOnly" :dashboard_id="id" :edit-chart="handleEditChart" :updated_at="updatedAt" :extraParams="extraParams" @delete="handleDelete" />
      <template v-else>
        <div v-for="(item, index) in panels" :key="index">
          <dashboard-card
           :card_style="card_style"
           :chartHeigth="chartHeigth"
           :panel="item"
           :focusPanelId="focusPanelId"
           :selectable="selectable"
           :readOnly="readOnly"
           :dashboard_id="id"
           :edit-chart="handleEditChart"
           :updated_at="updatedAt"
           :extraParams="extraParams"
           :time="time"
           :timeGroup="timeGroup"
           :customTime="customTime"
           :groupFunc="groupFunc"
           :tablePageSize="tablePageSize"
           :useLocalPanels="useLocalPanels"
           @pageChange="(pager) => pageChange(item, pager)"
           @chose_panel="chose_panel"
           @delete="handleDelete" />
        </div>
      </template>
      <!-- <a-list v-else :grid="{ column: 1 }" :data-source="panels">
        <a-list-item slot="renderItem" slot-scope="item" className="owner-item">
          <dashboard-card
           :card_style="card_style"
           :chartHeigth="chartHeigth"
           :panel="item"
           :focusPanelId="focusPanelId"
           :selectable="selectable"
           :readOnly="readOnly"
           :dashboard_id="id"
           :edit-chart="editChart"
           :updated_at="updatedAt"
           :extraParams="extraParams"
           :time="time"
           :timeGroup="timeGroup"
           :customTime="customTime"
           :groupFunc="groupFunc"
           :tablePageSize="tablePageSize"
           @pageChange="(pager) => pageChange(item, pager)"
           @chose_panel="chose_panel"
           @delete="handleDelete" />
        </a-list-item>
      </a-list> -->
    </div>
  </div>
</template>

<script>
import { uuid } from '@/utils/utils'
import MonitorHeader from '@/sections/Monitor/Header'
import MonitorTimeMixin from '@/mixins/monitorTime'
import DashboardCard from '../DashboardCard'

export default {
  name: 'DashboardCards',
  components: {
    DashboardCard,
    MonitorHeader,
  },
  mixins: [MonitorTimeMixin],
  props: {
    id: {
      type: String,
      default: '',
    },
    createChart: {
      type: Function,
      required: true,
    },
    adjustChartOrder: {
      type: Function,
      required: true,
    },
    editChart: {
      type: Function,
      required: true,
    },
    extraParams: {
      type: Object,
      default: () => ({}),
    },
    readOnly: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    selectable: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    focusPanelId: {
      type: String,
      default: () => {
        return ''
      },
    },
    card_style: {
      type: String,
    },
    chartHeigth: {
      type: String,
      default: '320px',
    },
    panelId: {
      type: String,
    },
    useLocalPanels: {
      type: Boolean,
      default: false,
    },
    localPanels: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      dashboard: {},
      panelMan: new this.$Manager('alertpanels', 'v1'),
      dashboardMan: new this.$Manager('alertdashboards', 'v1'),
      charts: [],
      updatedAt: '',
      time: '1h',
      timeGroup: '1m',
      customTime: null,
      groupFunc: 'mean',
      tablePageSize: 10,
    }
  },
  computed: {
    panels () {
      if (this.useLocalPanels) return this.localPanels
      if (this.panelId) {
        const obj = this.dashboard.alert_panel_details ? this.dashboard.alert_panel_details.find(x => { return x.panel_id === this.panelId }) : {}
        return [obj]
      } else {
        return this.dashboard.alert_panel_details ? this.dashboard.alert_panel_details : []
      }
    },
  },
  watch: {
    id: {
      deep: true,
      handler () {
        this.fetchCharts()
      },
    },
    time (val) {
      this.saveMonitorConfig()
    },
    timeGroup () {
      this.saveMonitorConfig()
    },
    groupFunc () {
      this.saveMonitorConfig()
    },
    customTime () {
      this.saveMonitorConfig()
    },
  },
  mounted () {
    this.fetchCharts()
  },
  methods: {
    handleEditChart ({ id }) {
      this.$emit('editChart', { id, time: this.time, timeGroup: this.timeGroup, customTime: this.customTime, groupFunc: this.groupFunc })
      this.editChart({ id, time: this.time, timeGroup: this.timeGroup, customTime: this.customTime, groupFunc: this.groupFunc })
    },
    pageChange (panel, pager) {
      this.saveMonitorConfig({ tablePageSize: pager.limit })
    },
    initTablePageSize (size) {
      this.tablePageSize = size
    },
    handleMenuClick () {
      this.$emit('adjustChartOrder', this.dashboard)
    },
    changePanelsOrder (panels) {
      this.dashboard.alert_panel_details = [...panels]
    },
    fetchDataSuccess () {
      this.saveMonitorConfig()
    },
    resize () {
      this.$refs.dashboardCard && this.$refs.dashboardCard.resize()
    },
    chose_panel (obj) {
      this.$emit('chose_panels', { id: obj.id, name: obj.name })
    },
    handleRefresh () {
      this.fetchCharts()
    },
    handleDelete () {
      this.fetchCharts()
    },
    getFirstDashborad (data) {
      for (let i = 0; i < data.length; i++) {
        const element = data[i]
        if (element.alert_panel_details && element.alert_panel_details.length > 0) {
          return element
        }
      }
    },
    async fetchCharts () {
      this.saveMonitorConfig()
      if (this.useLocalPanels) return
      this.loading = true
      try {
        const params = {
          scope: this.scope,
          details: true,
          $t: uuid(),
        }
        if (this.id) {
          const { data } = await this.dashboardMan.get({ id: this.id, params })
          this.dashboard = data
          const first = this.dashboard.alert_panel_details ? this.dashboard.alert_panel_details : []
          this.$emit('chose_first_panel', first && first.length > 0 ? first[0].panel_id : '')
        } else {
          const { data: { data } } = await this.dashboardMan.list({ params })
          this.dashboard = this.getFirstDashborad(data)
          const first = this.dashboard.alert_panel_details
          this.$emit('chose_first_panel', { panel: first[0], dashboardId: this.dashboard })
          this.$emit('chose_panels', { id: first[0].panel_id, name: first[0].panel_name, dashboardId: this.dashboard.id })
        }
        this.updatedAt = new Date().toISOString()
        this.loading = false
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.owner-item {
  margin: 0;
}
</style>
