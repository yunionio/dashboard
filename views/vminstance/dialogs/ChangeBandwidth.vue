<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1185')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1185')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item :label="$t('compute.text_1186')" v-bind="formItemLayout">
          <a-tooltip placement="top" :title="$t('compute.text_1338', [[10000]])">
            <a-input-number
              v-decorator="decorators.bandwidth"
              :parser="getParser"
              :min="0"
              :max="10000" />
            Mbps
          </a-tooltip>
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
  name: 'VmChangeBandwidthDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        bandwidth: [
          'bandwidth',
          {
            initialValue: this.params.data[0].bw_limit || 0,
            rules: [
              { required: true, message: this.$t('compute.text_1188') },
            ],
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
  methods: {
    async handleConfirm () {
      this.loading = true
      let manager = new this.$Manager('servers')
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.guest_id)
        const data = {
          bandwidth: values.bandwidth,
          index: this.params.data[0].index,
        }
        await manager.batchPerformAction({
          ids,
          action: 'change-bandwidth',
          data,
        })
        this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
        manager = null
      }
    },
    getParser (val) {
      if (isNaN(val)) {
        return 0
      }
      return Math.round(val)
    },
  },
}
</script>
