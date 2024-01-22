<template>
  <div>
    <page-body>
      <a-form :form="form.fc" v-bind="formLayout" hideRequiredMark>
        <a-form-item :label="$t('cloudenv.text_95')">
          <a-input :placeholder="$t('cloudenv.text_190')" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_360')">
          {{ $t('cloudenv.sync_account') }}
        </a-form-item>
        <scheduled-task-time ref="taskTime" :form="form" />
      </a-form>
    </page-body>
  </div>
</template>

<script>
import ScheduledTaskTime from '@Cloudenv/sections/ScheduledTaskTime'

export default {
  name: 'ScheduledSettings',
  components: {
    ScheduledTaskTime,
  },
  props: {
    account: {
      type: Object,
      default: () => { return {} },
    },
  },
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: this.account.name ? `aoto-sync-${this.account.name}-${this.$moment().format('YYYYMMDD')}` : '',
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
            ],
          },
        ],
      },
      formLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 8 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
    }
  },
  methods: {
    generateData (resId, values) {
      const params = {
        resource_type: 'cloudaccount',
        label_type: 'id',
        labels: [resId],
        operation: 'sync',
        generate_name: values.name,
      }
      this.$refs.taskTime.transformParams(params, values)
      return params
    },
    async handleConfirm (resId) {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const params = this.generateData(resId, values)
        await new this.$Manager('scheduledtasks', 'v1').create({ data: params })
        this.$router.push('/cloudaccount')
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
