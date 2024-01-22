<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('cloudenv.text_432') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('cloudenv.text_12')" class="mt-3" :count="params.data.length" :action="$t('cloudenv.text_432')" />
      <dialog-table v-if="columns && columns.length" :data="params.data" :columns="columns" />
      <a-form :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('cloudenv.text_95')">
          <a-input :placeholder="$t('cloudenv.text_190')" v-decorator="decorators.name" />
          <template v-slot:extra>
            <name-repeated res="scheduledtasks" :name="form.fd.name" />
          </template>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_360')">
          {{ $t('cloudenv.sync_account') }}
        </a-form-item>
        <scheduled-task-time ref="taskTime" :form="form" />
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import ScheduledTaskTime from '@Cloudenv/sections/ScheduledTaskTime'
import {
  getStatusTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import NameRepeated from '@/sections/NameRepeated'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ScheduledtaskCreateDialog',
  components: {
    NameRepeated,
    ScheduledTaskTime,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
            ],
          },
        ],
      },
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          name: '',
        },
      },
      columns: [
        {
          field: 'name',
          title: this.$t('table.title.name'),
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              return row.name
            },
          },
        },
        getStatusTableColumn({ statusModule: 'cloudaccount', minWidth: 90 }),
        getEnabledTableColumn({ minWidth: 90 }),
      ],
      formItemLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 3 },
        },
      },
      cycleTypeOpts: [
        { key: 'hour', label: this.$t('cloudenv.cycle_type.hour') },
        { key: 'day', label: this.$t('cloudenv.cycle_type.day') },
        { key: 'week', label: this.$t('cloudenv.cycle_type.week') },
        { key: 'month', label: this.$t('cloudenv.cycle_type.month') },
      ],
    }
  },
  methods: {
    generateData (values) {
      const params = {
        resource_type: 'cloudaccount',
        label_type: 'id',
        labels: [this.params.resId],
        operation: 'sync',
        generate_name: values.name,
      }
      this.$refs.taskTime.transformParams(params, values)
      return params
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const params = this.generateData(values)
        await new this.$Manager('scheduledtasks', 'v1').create({ data: params })
        this.params.callback && this.params.callback()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
