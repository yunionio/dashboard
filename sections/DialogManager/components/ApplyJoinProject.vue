<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <a-form :form="form.fc">
        <a-form-item
          :label="$t('common.description')"
          v-bind="formItemLayout">
          <a-input v-decorator="decorators.desc" />
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
  name: 'ApplyJoinProjectDialog',
  mixins: [workflowMixin, DialogMixin, WindowsMixin],
  data () {
    return {
      title: `${this.$t('common.text00073')}${this.$t('dictionary.project')}`,
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
        desc: ['desc', { rules: [{ required: true, message: this.$t('common.text00074') }] }],
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo']),
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_JOIN_PROJECT)
    },
  },
  methods: {
    async handleJoinProjectByWorkflowSubmit (values) {
      const variables = {
        project_domain: this.userInfo.projectDomainId,
        process_definition_key: WORKFLOW_TYPES.APPLY_JOIN_PROJECT,
        initiator: this.userInfo.id,
        paramter: JSON.stringify({ domain: this.userInfo.domain.id }),
        description: values.desc,
      }
      await this.createWorkflow(variables)
      this.$message.success(this.$t('common.text00075'))
      if (this.params.success) {
        this.params.success()
      } else {
        this.$router.push('/workflow')
      }
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
