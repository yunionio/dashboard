<template>
  <div>
    <div>
      <filter-bar :create-chart="createChart" :loading="loading" @refresh="handleRefresh" />
    </div>
    <div style="padding-top: 20px;">
      <a-list :grid="{ gutter: 16, column: 2 }" :data-source="panels">
        <a-list-item slot="renderItem" slot-scope="item">
          <dashboard-card :panel="item" :dashboard_id="id" :edit-chart="editChart" :updated_at="updatedAt" :extraParams="extraParams" @delete="handleDelete" />
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>

<script>
import DashboardCard from '../DashboardCard'
import filterBar from './filterbar'

export default {
  name: 'DashboardCards',
  components: {
    filterBar,
    DashboardCard,
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
    }
  },
  computed: {
    panels () {
      return this.dashboard.alert_panel_details ? this.dashboard.alert_panel_details : []
    },
  },
  watch: {
    id () {
      this.fetchCharts()
    },
  },
  created () {
    this.fetchCharts()
  },
  methods: {
    handleRefresh () {
      this.fetchCharts()
    },
    handleDelete () {
      this.fetchCharts()
    },
    async fetchCharts () {
      this.loading = true
      try {
        const params = {
          scope: this.scope,
          details: true,
        }
        const { data } = await this.dashboardMan.get({ id: this.id, params })
        this.dashboard = data
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
