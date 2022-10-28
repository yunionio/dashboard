import i18n from '@/locales'
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
          const { paramter } = obj.variables
          let data = {}
          if (paramter) {
            try {
              const form = JSON.parse(paramter)
              if (form.unitInfo) {
                data = form
              }
            } catch (err) {}
          }
          this.$router.push({
            name: 'WorkflowApplyInternalResourceCreate',
            params: {
              formData: data,
            },
          })
        },
        hidden: (obj) => {
          return !(obj.variables.audit_status === 'refused' && obj.process_definition_key === 'apply-internal-resource')
        },
      },
    ]
  },
}
