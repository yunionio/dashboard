<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1232')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">{{$t('compute.text_1390')}}</div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1232')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_1233')" v-bind="formItemLayout">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.autoRenew" />
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
    const autoRenew = this.params.data[0].auto_renew

    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        autoRenew: [
          'autoRenew',
          {
            initialValue: autoRenew,
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
      return new this.$Manager('servers', 'v2').batchPerformAction({
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
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
