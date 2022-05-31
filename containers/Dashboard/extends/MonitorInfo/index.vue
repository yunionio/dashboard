<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
        </div>
      </div>
      <div class="dashboard-card-body align-items-center justify-content-center h-100 w-100">
        <dashboard-cards ref="dashboardCard" card_style="h-100 w-100" :chartHeigth="'100%'" :panelId="fd.panelId" :selectable="false" :readOnly="true" :updated_at="updatedAt" :id="fd.dashboardId" :extraParams="extraParams"  />
      </div>
    </div>
    <base-drawer :visible.sync="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit">
      <monitor-form
        ref="monitor_form"
        :form="fd" />
    </base-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import debounce from 'lodash/debounce'
import { addListener, removeListener } from 'resize-detector'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import MonitorForm from './components/form'
// import DashboardCard from '@Monitor/components/MonitorCard/DashboardCard'
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
export default {
  name: 'MonitorInfo',
  components: {
    BaseDrawer,
    MonitorForm,
    // DashboardCard,
    DashboardCards,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
  },
  data () {
    const initNameValue = (this.params && this.params.name) || this.$t('dashboard.monitor')
    const dashboardId = (this.params && this.params.dashboardId) || ''
    const panelId = (this.params && this.params.panelId) || ''
    const panelName = (this.params && this.params.name) || ''
    return {
      uiStatus: false,
      seriesDescription: [],
      time: '1h',
      updatedAt: '',
      data: [],
      panel: {},
      visible: false,
      loading: false,
      scope: this.$store.getters.scope,
      dashboards: [],
      fd: {
        name: initNameValue,
        dashboardId: dashboardId,
        panelId: panelId,
        panelName: panelName,
      },
      rules: {
        name: [
          { required: true, message: this.$t('dashboard.text_8') },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'isAdminMode']),
    extraParams () {
      if (this.dashboard) {
        const scope = this.dashboard.scope || this.scope
        const params = { scope: scope }
        if (this.dashboard.domain_id) {
          params.domain_id = this.dashboard.domain_id
        }
        if (this.dashboard.tenant_id) {
          params.project_id = this.dashboard.tenant_id
        }
        return params
      }
      return {}
    },
  },
  mounted () {
    this.init()
  },
  destroyed () {
    this.destroy()
  },
  methods: {
    // refresh () {
    //   return this.fetchData()
    // },
    init () {
      this.__resizeHandler = debounce(
        () => {
          this.$refs.dashboardCard && this.$refs.dashboardCard.resize()
        },
        100,
        { leading: true },
      )
      addListener(this.$el, this.__resizeHandler)
    },
    destroy () {
      removeListener(this.$el, this.__resizeHandler)
    },
    handleEdit () {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.monitor_form.getData()
      })
    },
    genQueryData () {
      const ret = {
        metric_query: [
          {
            model: {
              database: 'meter_db',
              measurement: 'meter_res_usage',
              select: [
                [
                  {
                    type: 'field',
                    params: ['cpuCount'],
                  },
                  {
                    type: 'sum',
                    params: [],
                  },
                ],
                [
                  {
                    type: 'field',
                    params: ['memCount'],
                  },
                  {
                    type: 'sum',
                    params: [],
                  },
                ],
                [
                  {
                    type: 'field',
                    params: ['diskCount'],
                  },
                  {
                    type: 'sum',
                    params: [],
                  },
                ],
                [
                  {
                    type: 'field',
                    params: ['gpuCount'],
                  },
                  {
                    type: 'sum',
                    params: [],
                  },
                ],
                [
                  {
                    type: 'field',
                    params: ['baremetalCount'],
                  },
                  {
                    type: 'sum',
                    params: [],
                  },
                ],
              ],
              // tags: [
              //   {
              //     key: 'res_type',
              //     value: 'host',
              //     operator: '=',
              //   },
              // ],
              group_by: [
                {
                  type: 'time',
                  params: ['24h', '-8h'],
                },
                {
                  type: 'fill',
                  params: ['none'],
                },
              ],
            },
          },
        ],
        scope: this.scope,
        from: `${30 * 24}h`,
        now: 'now - 24h',
        unit: true,
      }
      if (this.isAdminMode) {
        // return `SELECT sum(cpuCount) AS "cpuCount", sum(memCount) AS "memCount", sum(diskCount) AS "diskCount", sum(gpuCount) AS "gpuCount", sum(baremetalCount) AS "baremetalCount" FROM meter_res_usage where time > now() - ${30 * 24}h and time <= now() - 24h GROUP BY time(24h,-8h)`
        return ret
      }
      ret.metric_query[0].model.tags = [
        {
          key: 'projectId',
          value: this.userInfo.projectId,
          operator: '=',
        },
      ]
      // return `SELECT sum(cpuCount) AS "cpuCount", sum(memCount) AS "memCount", sum(diskCount) AS "diskCount", sum(gpuCount) AS "gpuCount", sum(baremetalCount) AS "baremetalCount" FROM meter_res_usage where time > now() - ${30 * 24}h and time <= now() - 24h AND projectId='${this.userInfo.projectId}' GROUP BY time(24h,-8h)`
      return ret
    },
    async handleSubmit () {
      this.fd.panelName = this.$refs.monitor_form.$data.focusPanelName
      this.fd.name = this.$refs.monitor_form.$data.focusPanelName
      this.fd.panelId = this.$refs.monitor_form.$data.focusPanelId
      this.fd.dashboardId = this.$refs.monitor_form.$data.dashboardId
      try {
        this.$emit('update', this.options.i, this.fd)
        this.visible = false
        this.fetchData()
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
<style scoped lang='less'>
  .ant-row{
    width: 100%;
    height: 100%;
    .ant-col{
      height: 100%;
    }
  }
  .monitor-overview-card{
    padding: 0;
  }
</style>
