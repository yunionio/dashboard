<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1054')}}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('compute.text_1051')" :extra="$t('compute.text_1055')">
          <a-input-number :min="1" v-decorator="decorators.cpu_core_count" /> {{$t('compute.text_167')}}</a-form-item>
        <a-form-item :label="$t('compute.text_1052')" :extra="$t('compute.text_1056')">
          <a-input-number :min="0.5" v-decorator="decorators.memory_size_mb" /> GB
        </a-form-item>
        <a-form-item :label="$t('compute.system_disk_max')">
          <a-input-number :min="0" v-decorator="decorators.sys_disk_max_size_gb" /> GB
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
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
  name: 'CreateSkuDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        cpu_core_count: [
          'cpu_core_count',
          {
            initialValue: 4,
          },
        ],
        memory_size_mb: [
          'memory_size_mb',
          {
            initialValue: 16,
          },
        ],
        sys_disk_max_size_gb: [
          'sys_disk_max_size_gb',
          {
            initialValue: 2048,
          },
        ],
        description: ['description'],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        values.memory_size_mb = values.memory_size_mb * 1024
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
