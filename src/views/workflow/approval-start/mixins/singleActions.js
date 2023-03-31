import { mapGetters } from 'vuex'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import i18n from '@/locales'

export default {
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('common_368'),
        action: obj => {
          const { process_instance } = obj
          let dialogName = 'WorkflowPassDialog'
          if (process_instance.process_definition_key === 'apply-internal-resource') {
            dialogName = 'ApplyResourceWorkflowPassDialog'
          }
          this.createDialog(dialogName, {
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
          function checkValidate (obj) {
            return obj.process_instance.process_definition_key !== WORKFLOW_TYPES.CUSTOMER_SERVICE
          }
          return { validate: checkValidate(obj) }
        },
      },
      // {
      //   label: i18n.t('common_366'),
      //   action: obj => {
      //     this.createDialog('WorkflowHandingDialog', {
      //       vm: this,
      //       data: [obj],
      //       columns: this.columns,
      //       onManager: this.onManager,
      //       success: () => {
      //         this.refresh()
      //       },
      //     })
      //   },
      //   meta: (obj) => {
      //     function checkValidate (obj) {
      //       if (obj.process_instance.process_definition_key === WORKFLOW_TYPES.CUSTOMER_SERVICE) {
      //         if (!obj.variables.initiator_to_do) {
      //           return true
      //         }
      //       }
      //       return false
      //     }
      //     return { validate: checkValidate(obj) }
      //   },
      // },
      {
        label: i18n.t('common_370'),
        action: obj => {
          this.createDialog('WorkflowRejectDialog', {
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
          function checkValidate (obj) {
            return obj.process_instance.process_definition_key !== WORKFLOW_TYPES.CUSTOMER_SERVICE
          }
          return { validate: checkValidate(obj) }
        },
      },
      // {
      //   label: i18n.t('common_363'),
      //   action: obj => {
      //     this.createDialog('WorkflowFeedbackDialog', {
      //       vm: this,
      //       data: [obj],
      //       columns: this.columns,
      //       onManager: this.onManager,
      //       success: () => {
      //         this.refresh()
      //       },
      //     })
      //   },
      //   meta: (obj) => {
      //     const id = this.userInfo.id
      //     function checkValidate (obj) {
      //       if (obj.process_instance.process_definition_key === WORKFLOW_TYPES.CUSTOMER_SERVICE) {
      //         if (obj.variables.initiator_to_do && obj.process_instance.start_user_id === id) {
      //           return true
      //         }
      //       }
      //       return false
      //     }
      //     return { validate: checkValidate(obj) }
      //   },
      // },
      // {
      //   label: i18n.t('common_356'),
      //   action: obj => {
      //     this.createDialog('WorkflowEndDialog', {
      //       vm: this,
      //       data: [obj],
      //       columns: this.columns,
      //       onManager: this.onManager,
      //       success: () => {
      //         this.refresh()
      //       },
      //     })
      //   },
      //   meta: (obj) => {
      //     const id = this.userInfo.id
      //     function checkValidate (obj) {
      //       if (obj.process_instance.process_definition_key === WORKFLOW_TYPES.CUSTOMER_SERVICE) {
      //         if (obj.variables.initiator_to_do && obj.process_instance.start_user_id === id) {
      //           return true
      //         }
      //       }
      //       return false
      //     }
      //     return { validate: checkValidate(obj) }
      //   },
      // },
    ]
  },
}
