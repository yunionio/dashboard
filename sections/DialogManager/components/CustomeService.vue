<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item
          :label="this.$t('common.text00080')">
          <a-textarea :autoSize="{ minRows: 4, maxRows: 5 }" v-decorator="decorators.comment" />
        </a-form-item>
        <a-form-item :label="$t('common.workflow_priority')">
        <a-radio-group v-decorator="decorators.priority">
          <a-radio-button v-for="item in PRIORITY_OPTS" :value="item.key" :key="item.key">{{ item.value }}</a-radio-button>
        </a-radio-group>
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
import { WORKFLOW_TYPES, PRIORITY_OPTS } from '@/constants/workflow'

export default {
  name: 'CustomeServiceDialog',
  mixins: [workflowMixin, DialogMixin, WindowsMixin],
  data () {
    return {
      PRIORITY_OPTS,
      title: this.$t('common.text00081'),
      loading: false,
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        comment: ['comment', { rules: [{ required: true, message: this.$t('common.text00082') }] }],
        priority: [
          'priority',
          {
            initialValue: 'minor',
          },
        ],
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
        priority: values.priority,
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
