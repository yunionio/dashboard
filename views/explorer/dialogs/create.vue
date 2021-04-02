<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('monitor.dashboard.dialog.project.create')}}</div>
    <div slot="body">
      <a-form :form="form" v-bind="formLayout">
        <a-form-item :label="$t('compute.text_228')">
          <a-input v-decorator="decorators.name" :placeholder="$t('common.placeholder')"  />
        </a-form-item>
        <a-form-item :label="$t('monitor.dashboard.title')">
          <base-select
              filterable
              v-decorator="decorators.dashboard_id"
              :loading="loading"
              resource="alertdashboards"
              :options="dashboards" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CreateMonitorDashboardChart',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: this.$form.createForm(this),
      manager: new this.$Manager('alertdashboards', 'v1'),
      dashboards: [],
      decorators: {
        dashboard_id: [
          'dashboard_id',
          {
            rules: [
              { required: true, message: this.$t('monitor.dashboard.create.chart.dashboard.tips') },
            ],
          },
        ],
        name: [
          'name',
          {
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
            ],
          },
        ],
      },
      formLayout: {
        wrapperCol: {
          md: { span: 20 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 4 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
    }
  },
  created () {
    this.fetchDashboards()
  },
  methods: {
    async fetchDashboards () {
      this.loading = true
      this.dashboards = []
      try {
        const params = {
          scope: this.scope,
        }
        const { data: { data } } = await this.manager.list({ params })
        this.dashboards = data
        this.loading = false
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const data = {
          dashboard_id: values.dashboard_id,
          name: values.name,
          metric_query: this.params.metric_query,
          interval: this.params.timeGroup,
          scope: this.$store.getters.scope,
          ...this.params.timeRangeParams,
        }
        if (!data.metric_query || !data.metric_query.length || !data.from || !data.dashboard_id) return
        await new this.$Manager('alertpanels', 'v1').create({ data })
        this.loading = false
        this.$message.success(this.$t('cloudenv.text_381'))
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
