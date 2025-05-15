<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('compute.text_100')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form-model v-bind="formItemLayout">
        <a-form-model-item :label="$t('compute.billing_type')">
          <a-radio-group v-model="billingType">
            <a-radio-button value="prepaid">{{ $t('compute.sku.prepaid_status') }}</a-radio-button>
            <a-radio-button value="postpaid">{{ $t('compute.sku.postpaid_status') }}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
      </a-form-model>
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
  name: 'DiskChangeBillingTypeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.change_billing_type'),
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      billingType: this.params.data[0].billing_type,
    }
  },
  computed: {
    columns () {
      const showFields = ['name', 'disk_type', 'billing_type']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    async doResetSubmit () {
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: this.params.steadyStatus,
        managerArgs: {
          action: 'change-billing-type',
          data: {
            billing_type: this.billingType,
          },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doResetSubmit()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
