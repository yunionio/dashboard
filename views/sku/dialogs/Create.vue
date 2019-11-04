<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="平台" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.resource_type">
            <a-radio-button
              v-for="item in resourceTypeOpts"
              :value="item.key"
              :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="虚拟CPU核数" v-bind="formItemLayout">
          <a-input-number :min="1" :max="100000" v-decorator="decorators.cpu_core_count" /> 核
        </a-form-item>
        <a-form-item label="虚拟内存容量" v-bind="formItemLayout">
          <a-input-number :min="1" :max="100000" v-decorator="decorators.memory_size_mb" /> GB
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
        resource_type: [
          'resource_type',
          {
            initialValue: 'VMware',
          },
        ],
        cpu_core_count: [
          'cpu_core_count',
          {
            initialValue: 1,
          },
        ],
        memory_size_mb: [
          'memory_size_mb',
          {
            initialValue: 1,
          },
        ],
      },
      resourceTypeOpts: [
        { key: 'VMware', label: 'VMware' },
        { key: 'OneCloud', label: 'OneCloud' },
        { key: 'OpenStack', label: 'OpenStack' },
        { key: 'DStack', label: 'DStack' },
      ],
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
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
      return this.params.list.onManager('create', {
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
