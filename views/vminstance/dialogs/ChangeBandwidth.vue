<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更改带宽</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="更改带宽" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="带宽" v-bind="formItemLayout" extra="Mbps，请输入0~10000的整数">
          <a-input-number
            v-decorator="decorators.bandwidth"
            :parser="Math.round"
            :min="0"
            :max="10000" />
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
              { required: true, message: '请输入带宽限制' },
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
        this.params.list.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
        manager = null
      }
    },
  },
}
</script>
