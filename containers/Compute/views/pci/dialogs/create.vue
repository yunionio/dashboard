<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('common.create') }}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.pci.dev_type')">
          <a-input v-decorator="decorators.dev_type" :placeholder="$t('compute.pci.dev_type.placeholder')" />
        </a-form-item>
        <a-form-item :label="$t('compute.pci.model')">
          <a-input v-decorator="decorators.model" :placeholder="$t('compute.pci.model.placeholder')" />
        </a-form-item>
        <a-form-item :label="$t('compute.pci.vendor_id')">
          <template #extra>
            {{ $t('compute.pci.vendor_id.extra') }}<help-link href="/">{{ $t('compute.pci.document') }}</help-link>
          </template>
          <a-input v-decorator="decorators.vendor_id" :placeholder="$t('compute.pci.vendor_id.placeholder')" />
        </a-form-item>
        <a-form-item :label="$t('compute.pci.device_id')">
          <template #extra>
            {{ $t('compute.pci.device_id.extra') }}<help-link href="/">{{ $t('compute.pci.document') }}</help-link>
          </template>
          <a-input v-decorator="decorators.device_id" :placeholder="$t('compute.pci.device_id.placeholder')" />
        </a-form-item>
        <a-form-item :label="$t('compute.pci.host')" :extra="$t('compute.pci.host.extra')">
          <base-select
            class="w-100"
            resource="hosts"
            v-decorator="decorators.hosts"
            :params="hostParams"
            :need-params="true"
            :filterable="true"
            :showSync="true"
            :select-props="{ allowClear: true, placeholder: this.$t('compute.pci.host.placeholder'), mode: 'multiple' }" />
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
  name: 'PciCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        dev_type: [
          'dev_type',
          {
            rules: [
              { required: true, message: this.$t('compute.pci.dev_type.placeholder') },
            ],
          },
        ],
        model: [
          'model',
          {
            rules: [
              { required: true, message: this.$t('compute.pci.model.placeholder') },
            ],
          },
        ],
        vendor_id: [
          'vendor_id',
          {
            rules: [
              { required: true, message: this.$t('compute.pci.vendor_id.placeholder') },
            ],
          },
        ],
        device_id: [
          'device_id',
          {
            rules: [
              { required: true, message: this.$t('compute.pci.device_id.placeholder') },
            ],
          },
        ],
        hosts: [
          'hosts',
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      hostParams: {
        details: false,
      },
    }
  },
  methods: {
    doSubmit (data) {
      return new this.$Manager('isolated_device_models').create({
        data,
      })
    },
    async handleConfirm () {
      const { validateFields } = this.form.fc
      try {
        this.loading = true
        const values = await validateFields()
        await this.doSubmit(values)
        console.log('values', values)
        this.loading = false
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
