<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <a-form :form="form.fc">
        <a-form-item
          label="问题描述"
          v-bind="formItemLayout">
          <a-textarea :autoSize="{ minRows: 4, maxRows: 5 }" v-decorator="decorators.comment" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import workflowMixin from '@/mixins/workflow'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { WORKFLOW_TYPES } from '@/constants/workflow'

export default {
  name: 'CustomeServiceDialog',
  mixins: [workflowMixin, DialogMixin, WindowsMixin],
  data () {
    return {
      title: '申请技术支持',
      loading: false,
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        comment: ['comment', { rules: [{ required: true, message: '必须填写问题描述' }] }],
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo']),
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.CUSTOMER_SERVICE)
    },
  },
  methods: {
    async handleJoinProjectByWorkflowSubmit (values) {
      const variables = {
        process_definition_key: WORKFLOW_TYPES.CUSTOMER_SERVICE,
        initiator: this.userInfo.id,
        comment: values.comment,
      }
      await this.createWorkflow(variables)
      this.$message.success('加入项目流程已提交')
      this.$router.push('/workflow')
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (this.isOpenWorkflow) {
          await this.handleJoinProjectByWorkflowSubmit(values)
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
