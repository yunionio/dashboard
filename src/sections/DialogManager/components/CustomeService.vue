<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <a-form :form="form.fc">
        <a-form-item
          :label="this.$t('common.text00080')"
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
      title: this.$t('common.text00081'),
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
        comment: ['comment', { rules: [{ required: true, message: this.$t('common.text00082') }] }],
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
      this.$message.success(this.$t('common.text00083'))
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
