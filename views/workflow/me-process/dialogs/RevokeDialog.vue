<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      <dialog-selected-tips name="工单" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item label="备注">
          <a-input placeholder="请输入备注" v-decorator="decorators.remarks" />
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
const R = require('ramda')

export default {
  name: 'WorkflowRevokeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: '撤销工单',
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        remarks: [
          'remarks',
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 22,
        },
        labelCol: {
          span: 2,
        },
      },
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const ids = this.params.data.map(item => item.id)
        const values = await this.form.fc.validateFields()
        const params = { delete_reason: values.remarks }
        const res = await new this.$Manager('process-instances', 'v1').batchDelete({
          ids,
          params,
        })
        const isOk = res.data.data.every(item => item.status === 200)
        if (isOk) {
          if (this.params.vm && this.params.vm.destroySidePages) {
            this.params.vm.destroySidePage(this.params.vm.windowId)
          }
          if (this.params.success && R.is(Function, this.params.success)) {
            this.params.success()
          }
          this.$message.success('操作成功')
        }
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
