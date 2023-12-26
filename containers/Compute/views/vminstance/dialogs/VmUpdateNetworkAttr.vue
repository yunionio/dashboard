<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('compute.text_247') }}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">
          {{ $t('compute.update_network.alert') }}
        </div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_247')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.num_queues')">
          <a-tooltip placement="top" :title="$t('compute.num_queues')">
            <a-input-number
              v-decorator="decorators.num_queues"
              :min="1"
              :max="16" />
          </a-tooltip>
        </a-form-item>
        <a-form-item :label="$t('compute.text_860')">
            <a-select v-decorator="decorators.driver">
              <a-select-option v-for="item of driverArr" :key="item.key" :value="item.key">{{item.label}}</a-select-option>
            </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.nics.is_default')">
            <a-switch v-decorator="decorators.is_default" :disabled="is_default_on_init" />
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
  name: 'VmUpdateNetworkAttrDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        num_queues: [
          'num_queues',
          {
            initialValue: this.params.data[0].num_queues || 1,
          },
        ],
        driver: [
          'driver',
          {
            initialValue: this.params.data[0].driver || 'virtio',
          },
        ],
        is_default: [
          'is_default',
          {
            valuePropName: 'checked',
            initialValue: this.params.data[0].is_default || false,
          },
        ],
      },
      driverArr: [
        { key: 'virtio', label: 'virtio' },
        { key: 'e1000', label: 'e1000' },
        { key: 'vmxnet3', label: 'vmxnet3' },
        { key: 'rtl8139', label: 'rtl8139' },
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
  computed: {
    selectedItems () {
      return this.params.data
    },
    is_default_on_init () {
      return this.params.data[0].is_default
    },
  },
  methods: {
    async doUpdateNetworkAttr (values) {
      const manager = new this.$Manager('servers')
      const sid = this.params.resId
      const nid = this.params.data[0].network_id
      const data = {
        num_queues: values.num_queues,
        driver: values.driver,
        is_default: values.is_default,
      }
      return manager.update({
        id: `${sid}/networks/${nid}`,
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doUpdateNetworkAttr(values)
        this.params.refresh()
        this.cancelDialog()
        this.$message.success(this.$t('compute.text_423'))
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
