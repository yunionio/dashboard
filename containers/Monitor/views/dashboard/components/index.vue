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
              <a-menu-item key="handleEditName"><a-icon type="edit" />{{$t('monitor.edit_name')}}</a-menu-item>
              <a-menu-item key="handleClone"><a-icon type="copy" />{{$t('dashboard.text_107')}}</a-menu-item>
              <a-menu-item key="handleDelete"><a-icon type="delete" />{{$t('scope.text_18')}}</a-menu-item>
            </a-menu>
          </a-dropdown>
        </a-col>
      </a-row>
      <a-row>
        <a-divider />
      </a-row>
      <a-row v-if="dashboardId">
        <dashboard-cards ref="dashboardCards" :id="dashboardId" :extraParams="extraParams" :create-chart="createChart" @adjustChartOrder="adjustChartOrder" :edit-chart="editChart" />
      </a-row>
    </div>
  </div>
</template>

<script>
import i18n from '@/locales'
import storage from '@/utils/storage'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'

const alertDashboardScopeColumn = {
  field: 'scope',
  title: i18n.t('IAM.text_1'),
  formatter: ({ row }) => {
    const data = row
    let desc = '-'
    if (data.scope === 'system') {
      desc = i18n.t('monitor.dashboard.select.option', [i18n.t('shareScope.system')])
    }
    if (data.scope === 'domain') {
      desc = i18n.t('monitor.dashboard.select.option', [data.project_domain, i18n.t('cloudenv.text_393')])
    }
    if (data.scope === 'project') {
      desc = i18n.t('monitor.dashboard.select.option', [data.project, i18n.t('cloudenv.text_254')])
    }
    return desc
  },
}

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
      const scope = this.scope
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
  watch: {
    dashboardId: {
      immediate: true,
      handler: function (val) {
        if (val) {
          // 记录到本地
          this.setMonitorLocal({ monitorDashboardId: val })
        }
      },
    },
  },
  created () {
    this.dashboardId ? this.fetchDashboards() : this.switchDashboard(false)
  },
  methods: {
    getMonitorConfig () {
      return storage.get('__oc_monitor_query_config__', {})
    },
    setMonitorLocal (config) {
      const monitorConfig = this.getMonitorConfig()
      storage.set('__oc_monitor_query_config__', {
        ...monitorConfig,
        ...config,
      })
    },
    handleCreateDashboard () {
      this.createDialog('CreateMonitorDashboard', {
        refresh: this.switchDashboard,
      })
    },
    adjustChartOrder (dashboard) {
      this.createDialog('MonitorDashboardAdjustOrderDialog', {
        dashboard: dashboard,
        data: this.dashboards.filter((item) => { return item.id === dashboard.id }),
        columns: [getNameDescriptionTableColumn(), alertDashboardScopeColumn],
        ok: (panels) => {
          const index = this.dashboards.findIndex((item) => { return item.id === dashboard.id })
          if (index > -1) {
            this.dashboards[index].alert_panel_details = panels
            this.$refs.dashboardCards.changePanelsOrder(panels)
          } else {
            this.fetchDashboards()
          }
        },
      })
    },
    handleActionClick ({ key }) {
      if (this[key]) this[key]()
    },
    handleEditName () {
      const index = this.dashboards.findIndex((item) => { return item.id === this.dashboardId })
      this.createDialog('MonitorDashboardChangeName', {
        data: [this.dashboards[index]],
        columns: [getNameDescriptionTableColumn(), alertDashboardScopeColumn],
        ok: (name) => {
          this.dashboards = this.dashboards.map((item, idx) => {
            if (idx === index) item.name = name
            return item
          })
        },
      })
    },
    handleClone () {
      this.createDialog('CloneMonitorDashboard', {
        data: this.dashboards.filter((item) => { return item.id === this.dashboardId }),
        refresh: this.switchDashboard,
        columns: [getNameDescriptionTableColumn(), alertDashboardScopeColumn],
      })
    },
    handleDelete () {
      this.createDialog('DeleteMonitorDashboard', {
        data: this.dashboards.filter((item) => { return item.id === this.dashboardId }),
        refresh: this.switchDashboard,
        columns: [getNameDescriptionTableColumn(), alertDashboardScopeColumn],
      })
    },
    createChart () {
      this.$router.push({
        name: 'MonitorDashboardChartCreate',
        params: {
          dashboard: this.dashboardId,
          ...this.extraParams,
        },
      })
    },
    editChart ({ id, time, timeGroup, customTime, groupFunc }) {
      if (!id) return
      this.$router.push({
        name: 'MonitorDashboardChartUpdate',
        params: {
          id,
          time,
          timeGroup,
          customTime,
          groupFunc,
          dashboard: this.dashboardId,
          ...this.extraParams,
        },
      })
    },
    switchDashboard (ignoreLocal = true) {
      this.fetchDashboards((data) => {
        // 使用本地保存的
        const monitorConfig = this.getMonitorConfig()
        if (monitorConfig.monitorDashboardId && !ignoreLocal && data.some(item => item.id === monitorConfig.monitorDashboardId)) {
          this.dashboardId = monitorConfig.monitorDashboardId
        } else {
          this.dashboardId = data.length ? data[0].id : ''
        }
      })
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
