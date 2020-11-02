<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <a-form :form="form.fc">
        <a-form-item :label="$t('common.text00068')">
          <quota-set-to-workflow
            ref="quotaSetRef"
            sence="domain"
            :domain="userInfo.domain.id" />
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
import QuotaSetToWorkflow from '@/sections/QuotaSetToWorkflow'
import workflowMixin from '@/mixins/workflow'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { WORKFLOW_TYPES } from '@/constants/workflow'

export default {
  name: 'ApplyDomainQuotaDialog',
  components: {
    QuotaSetToWorkflow,
  },
  mixins: [workflowMixin, DialogMixin, WindowsMixin],
  data () {
    return {
      title: `${this.$t('common.text00069')}${this.$t('dictionary.domain')}${this.$t('common.text00070')}`,
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
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_DOMAIN_QUOTA)
    },
  },
  methods: {
    async handleApplyQuotaByWorkflowSubmit (quota) {
      const params = { ...quota, domain: this.userInfo.domain.id }
      const variables = {
        process_definition_key: WORKFLOW_TYPES.APPLY_DOMAIN_QUOTA,
        initiator: this.userInfo.id,
        paramter: JSON.stringify(params),
      }
      await this.createWorkflow(variables)
      this.$message.success(`${this.$t('common.text00070')}${this.$t('dictionary.domain')}${this.$t('common.text00071')}`)
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
        const quota = this.$refs.quotaSetRef.getParams()
        const oldQuota = this.$refs.quotaSetRef.quotaOptions
        const isChange = this.checkQuotaChangeHandle(oldQuota, quota)
        if (!isChange) {
          this.$message.error(`${this.$t('common.text00072')}`)
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
