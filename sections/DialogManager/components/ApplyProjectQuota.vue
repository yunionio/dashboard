<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <a-form :form="form.fc">
        <a-form-item label="配额设置">
          <quota-set-to-workflow
            ref="quotaSetRef"
            sence="project"
            :tenant="userInfo.projectId" />
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
import QuotaSetToWorkflow from '@System/sections/QuotaSetToWorkflow'
import workflowMixin from '@/mixins/workflow'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { WORKFLOW_TYPES } from '@/constants/workflow'

export default {
  name: 'ApplyProjectQuotaDialog',
  components: {
    QuotaSetToWorkflow,
  },
  mixins: [workflowMixin, DialogMixin, WindowsMixin],
  data () {
    return {
      title: `申请${this.$t('dictionary.project')}配额`,
      loading: false,
      formItemLayout: {
        wrapperCol: {
          span: 16,
        },
        labelCol: {
          span: 8,
        },
      },
      form: {
        fc: this.$form.createForm(this),
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo', 'isDomainMode']),
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_PROJECT_QUOTA)
    },
  },
  methods: {
    async handleApplyQuotaByWorkflowSubmit (quota) {
      const params = { ...quota, tenant: this.userInfo.projectId }
      const variables = {
        process_definition_key: WORKFLOW_TYPES.APPLY_PROJECT_QUOTA,
        initiator: this.userInfo.id,
        paramter: JSON.stringify(params),
      }
      await this.createWorkflow(variables)
      this.$message.success(`申请${this.$t('dictionary.project')}配额流程已提交`)
      if (this.params.success) {
        this.params.success()
      } else {
        this.$router.push('/workflow')
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        // const values = await this.form.fc.validateFields()
        let quota = this.$refs['quotaSetRef'].getParams()
        const oldQuota = this.$refs['quotaSetRef'].quotaOptions
        const isChange = this.checkQuotaChangeHandle(oldQuota, quota)
        if (!isChange) {
          this.$message.error('配额没有改变，请修改配额或者取消操作！')
          return
        }
        if (this.isOpenWorkflow) {
          await this.handleApplyQuotaByWorkflowSubmit(quota)
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    checkQuotaChangeHandle (oldQuota, quota) {
      let isChange = false
      for (let i = 0; i < oldQuota.length; i++) {
        const item = { ...oldQuota[i] }
        switch (item.key) {
          case 'memory':
            item.originQuota = item.originQuota * 1024
            break
          case 'storage':
            item.originQuota = item.originQuota * 1024
            break
          case 'object_gb':
            item.originQuota = item.originQuota * 1024
            break
        }
        if (quota[item.key] !== item.originQuota) {
          isChange = true
        }
      }
      return isChange
    },
  },
}
</script>
