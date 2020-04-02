<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">设置自动续费</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" action="设置自动续费" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item label="自动续费" v-bind="formItemLayout">
          <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.autoRenew" />
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
  name: 'VmResourceRenewFeeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        autoRenew: [
          'autoRenew',
          {
            initialValue: true,
            valuePropName: 'checked',
          },
        ],
      },
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
    columns () {
      const showFields = ['name', 'billing_type', 'brand']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
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
    doResourceRenewFeeSubmit (data) {
      const selectedIds = this.params.data.map(item => item.id)
      return new this.$Manager('hosts', 'v2').batchPerformAction({
        ids: selectedIds,
        action: 'set-auto-renew',
        data: {
          auto_renew: data.autoRenew,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        await this.doResourceRenewFeeSubmit(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
