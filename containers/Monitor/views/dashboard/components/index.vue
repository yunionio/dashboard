<template>
  <div v-if="!loading">
    <div v-if="isEmpty">
      <data-empty style="padding-top: 200px;">
        <a-button type="primary" @click="handleCreateDashboard">
          {{ $t('monitor.dashboard.dialog.create') }}
        </a-button>
      </data-empty>
    </div>
    <div v-else>
      <a-row :gutter="8">
        <a-col :span="10">
          <a-row type="flex" :gutter="8" justify="start">
            <a-col style="padding-top: 6px;padding-bottom: 6px;">{{ $t('monitor.dashboard.label') + ':' }}</a-col>
            <a-col flex="auto">
              <base-select
                  filterable
                  style="min-width: 150px;"
                  resource="alertdashboards"
                  v-model="dashboardId"
                  :options="dashboards" />
            </a-col>
          </a-row>
        </a-col>
        <a-col :span="4">
          <a-button type="primary" @click="handleCreateDashboard">
            {{ $t('monitor.dashboard.dialog.create') }}
          </a-button>
        </a-col>
        <a-col :span="9" />
        <a-col :span="1">
          <a-dropdown style="float: right" :trigger="['click']" placement="bottomRight">
            <a class="ant-dropdown-link font-weight-bold pl-2 pr-2 h-100 d-block action-btn" @click="e => e.preventDefault()">
              <icon type="more" style="font-size: 18px;" />
            </a>
            <a-menu slot="overlay" @click="handleActionClick">
<!--              <a-menu-item key="handleCopy"><a-icon type="copy" />{{$t('dashboard.text_107')}}</a-menu-item>-->
              <a-menu-item key="handleDelete"><a-icon type="delete" />{{$t('scope.text_18')}}</a-menu-item>
            </a-menu>
          </a-dropdown>
        </a-col>
      </a-row>
      <a-row>
        <a-divider />
      </a-row>
      <a-row v-if="dashboardId">
        <dashboard-cards :id="dashboardId" :extraParams="extraParams" :create-chart="createChart"  :edit-chart="editChart" />
      </a-row>
    </div>
  </div>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
import { getNameDescriptionTableColumn, getProjectTableColumn, getProjectDomainTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'DashboardIndex',
  components: {
    DashboardCards,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const dashboardId = this.$route.query.dashboard_id || ''
    return {
      scope: this.$store.getters.scope,
      loading: true,
      manager: new this.$Manager('alertdashboards', 'v1'),
      dashboards: [],
      dashboardId: dashboardId,
    }
  },
  computed: {
    isEmpty () {
      return !this.dashboards || this.dashboards.length === 0
    },
    dashboard () {
      if (this.dashboardId) {
        const ds = this.dashboards.filter((item) => { return item.id === this.dashboardId })
        if (ds.length > 0) {
          return ds[0]
        }
      }
      return {}
    },
    extraParams () {
      const scope = this.dashboard.scope || this.scope
      const params = { scope: scope }
      if (this.dashboard.domain_id) {
        params.domain_id = this.dashboard.domain_id
      }
      if (this.dashboard.tenant_id) {
        params.project_id = this.dashboard.tenant_id
      }
      return params
    },
  },
  created () {
    this.dashboardId ? this.fetchDashboards() : this.switchDashboard()
  },
  methods: {
    handleCreateDashboard () {
      this.createDialog('CreateMonitorDashboard', {
        refresh: this.switchDashboard,
      })
    },
    handleActionClick ({ key }) {
      if (this[key]) this[key]()
    },
    handleDelete () {
      this.createDialog('DeleteMonitorDashboard', {
        data: this.dashboards.filter((item) => { return item.id === this.dashboardId }),
        refresh: this.switchDashboard,
        columns: [getNameDescriptionTableColumn(), getProjectDomainTableColumn(), getProjectTableColumn()],
      })
    },
    createChart () {
      this.$router.push({
        path: '/monitor-dashboard/create',
        query: {
          dashboard: this.dashboardId,
          ...this.extraParams,
        },
      })
    },
    editChart ({ id }) {
      if (!id) return
      this.$router.push({
        path: `/monitor-dashboard/${id}/update`,
        query: {
          dashboard: this.dashboardId,
          ...this.extraParams,
        },
      })
    },
    switchDashboard () {
      this.fetchDashboards((data) => { this.dashboardId = data[0].id })
    },
    async fetchDashboards (callback) {
      this.loading = true
      this.dashboards = []
      try {
        const params = {
          scope: this.scope,
        }
        const { data: { data } } = await this.manager.list({ params })
        this.dashboards = data
        if (callback && typeof callback === 'function') {
          callback(data)
        }
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
