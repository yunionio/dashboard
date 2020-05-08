<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      <dialog-selected-tips name="工单" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item label="是否解决">
          <a-radio-group v-decorator="decorators.isResove">
            <a-radio :value="true">
              已解决
            </a-radio>
            <a-radio :value="false">
              未解决
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="评价">
          <a-textarea placeholder="请输入评价" v-decorator="decorators.remarks" />
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
import {
  getProcessDefinitionNameTableColumn,
  getResourceNameTableColumn,
  getInitiatorTableColumn,
} from '../../utils/columns'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
const R = require('ramda')

export default {
  name: 'WorkflowEndDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: '结束',
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        isResove: [
          'isResove',
          { initialValue: true },
        ],
        remarks: [
          'remarks',
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
      columns: [
        getProcessDefinitionNameTableColumn({ field: 'process_instance.process_definition_name', title: '名称' }),
        getResourceNameTableColumn({ title: '资源' }),
        getInitiatorTableColumn({ field: 'process_instance.start_user_name' }),
      ],
    }
  },
  computed: {
    selectedItems () {
      return this.params.data
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const ids = this.params.data.map(item => item.id || (item.process_instance && item.process_instance.id))
        const values = await this.form.fc.validateFields()
        let params = {
          variables: {
            satisfied: true, // 审批结果：true通过，false拒绝
            comment: values.isResove ? `已解决: ${values.remarks || '无评价'}` : `未解决: ${values.remarks || '无评价'}`, // 审批意见
          },
        }
        const state = this.selectedItems[0].process_instance && this.selectedItems[0].process_instance.state
        if (state === 'CUSTOM_TODO') {
          params['variables']['user_retry'] = true
        }
        const res = await new this.$Manager('process-tasks', 'v1').batchUpdate({
          ids,
          data: params,
        })
        const isOk = res.data.data.every(item => item.status === 200)
        if (isOk) {
          if (this.params.vm && this.params.vm.destroySidePages) {
            this.params.vm.destroySidePage(this.params.vm.windowId)
          }
          if (this.params.success && R.is(Function, this.params.success)) {
            this.params.success(res)
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
