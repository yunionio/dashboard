<template>
  <div :class="card_style">
    <div v-if="!readOnly" class="d-flex align-items-center justify-content-between">
      <monitor-header
        :time.sync="time"
        :timeGroup.sync="timeGroup"
        :showTimegroup="true"
        :showGroupFunc="false"
        showAutoRefresh
        @refresh="handleRefresh">
        <template v-slot:radio-button-append>
          <custom-date :time.sync="time" :customTime.sync="customTime" :showCustomTimeText="time==='custom'" />
        </template>
      </monitor-header>
      <a-button style="margin-left: 8px;" @click="createChart">
        {{ $t('monitor.dashboard.dialog.project.create')}}
      </a-button>
    </div>
    <div :class="card_style" :style="readOnly && !selectable ? '' :'padding-top: 20px;'">
      <dashboard-card ref="dashboardCard" v-if="readOnly && !selectable" :card_style="card_style" :chartHeigth="chartHeigth" @chose_panel="chose_panel" :panel="panels.length > 0 ? panels[0] : {}" :focusPanelId="focusPanelId" :selectable="selectable" :readOnly="readOnly" :dashboard_id="id" :edit-chart="editChart" :updated_at="updatedAt" :extraParams="extraParams" @delete="handleDelete" />
      <a-list v-else :grid="readOnly?{ gutter: 24, column: 1 }:{ gutter: 16, column: 2 }" :data-source="panels">
        <a-list-item slot="renderItem" slot-scope="item">
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
           @chose_panel="chose_panel"
           @delete="handleDelete" />
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>

<script>
import { uuid } from '@/utils/utils'
import MonitorHeader from '@/sections/Monitor/Header'
import CustomDate from '@/sections/CustomDate'
import DashboardCard from '../DashboardCard'

export default {
  name: 'DashboardCards',
  components: {
    DashboardCard,
    MonitorHeader,
    CustomDate,
  },
  props: {
    id: {
      type: String,
      default: '',
    },
    createChart: {
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
    }
  },
  computed: {
    panels () {
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
  },
  mounted () {
    this.fetchCharts()
  },
  methods: {
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

</style>
