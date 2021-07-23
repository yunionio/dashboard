<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('common_198')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('common_364')">
          <a-textarea :placeholder="$t('common_365')" v-decorator="decorators.remarks" />
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
import {
  getProcessDefinitionNameTableColumn,
  // getResourceNameTableColumn,
  getInitiatorTableColumn,
  getCommentTableColumn,
} from '../../utils/columns'
const R = require('ramda')

export default {
  name: 'WorkflowHandingDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('common_366'),
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        remarks: [
          'remarks',
          {
            rules: [
              { required: true, message: this.$t('common_365') },
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
      columns: [
        getProcessDefinitionNameTableColumn({ field: 'process_instance.process_definition_name', title: this.$t('common_186') }),
        // getResourceNameTableColumn({ title: this.$t('common_357') }),
        getInitiatorTableColumn({ field: 'process_instance.start_user_name' }),
        getCommentTableColumn({ title: this.$t('common_157'), field: 'process_instance.comment' }),
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
        const params = {
          variables: {
            approved: true, // 审批结果：true通过，false拒绝
            comment: values.remarks, // 审批意见
          },
        }
        const state = this.selectedItems[0].process_instance && this.selectedItems[0].process_instance.state
        if (state === 'CUSTOM_TODO') {
          params.variables.user_retry = true
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
          this.$message.success(this.$t('common_360'))
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
