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
        <dashboard-cards ref="dashboardCard" card_style="h-100 w-100 border-0" :chartHeigth="'100%'" @chose_panels="chose_panels" :panelId="fd.panelId" :readOnly="true" :selectable="false" :updated_at="updatedAt" :id="fd.dashboardId" :extraParams="extraParams"  />
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
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'

export default {
  name: 'MonitorInfo',
  components: {
    BaseDrawer,
    MonitorForm,
    DashboardCards,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: {
      type: Object,
      default () {
        return {}
      },
    },
  },
  data () {
    const name = (this.params && this.params.name) || this.$t('dashboard.monitor')
    const dashboardId = (this.params && this.params.dashboardId) || ''
    const panelId = (this.params && this.params.panelId) || ''
    const panelName = (this.params && this.params.name) || ''
    return {
      uiStatus: false,
      seriesDescription: [],
      time: '1h',
      dashboardMan: new this.$Manager('alertdashboards', 'v1'),
      updatedAt: '',
      data: [],
      panel: {},
      visible: false,
      loading: false,
      scope: this.$store.getters.scope,
      dashboards: [],
      fd: {
        name: name,
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
  watch: {
    params: {
      deep: true,
      immediate: true,
      async handler (val) {
      },
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
    chose_panels (panel) {
      console.log(panel, '=============')
      this.fd.panelName = panel.name
      this.fd.name = panel.name
      this.fd.panelId = panel.id
      this.fd.dashboardId = panel.dashboardId
      this.$emit('update', this.options.i, this.fd)
    },
    handleEdit () {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.monitor_form.getData()
      })
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
<style lang='less'>
  .dashboard-card-wrap{
    .monitor-overview-card{
      padding: 0!important;
    }
  }
  .border-0{
    border: 0 none!important;
  }
</style>
