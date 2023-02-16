import i18n from '@/locales'
import { getWorkflowParamter } from '@/utils/utils'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('common_403'),
        action: obj => {
          this.createDialog('WorkflowRevokeDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            success: () => {
              this.refresh()
            },
          })
        },
        meta: (obj) => {
          return {
            validate: obj.state !== 'COMPLETED' && obj.state !== 'EXTERNALLY_TERMINATED' && obj.variables.can_terminate_status !== false,
          }
        },
      },
      {
        label: i18n.t('wz_workflow_form.actions.re_apply'),
        action: obj => {
          const form = getWorkflowParamter(obj.variables)
          let data = {}
          if (form.unitInfo) {
            data = form
          }
          this.$router.push({
            name: 'WorkflowApplyInternalResourceCreate',
            params: {
              formData: data,
            },
          })
        },
        hidden: (obj) => {
          return !((obj.variables.audit_status === 'refused' || obj.state === 'EXTERNALLY_TERMINATED') && obj.process_definition_key === 'apply-internal-resource')
        },
      },
    ]
  },
}
