import { mapGetters } from 'vuex'
import { WORKFLOW_TYPES } from '@/constants/workflow'

export default {
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.singleActions = [
      {
        label: '通过',
        action: obj => {
          this.createDialog('WorkflowPassDialog', {
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
            validate: obj.process_instance.process_definition_key !== WORKFLOW_TYPES.CUSTOMER_SERVICE,
          }
        },
      },
      {
        label: '处理',
        action: obj => {
          this.createDialog('WorkflowHandingDialog', {
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
          const name = this.userInfo.name
          function checkValidate (obj) {
            if (obj.process_instance.process_definition_key !== WORKFLOW_TYPES.CUSTOMER_SERVICE) {
              return true
            } else {
              if (obj.process_instance.start_user_name === name) {
                return true
              }
            }
          }
          return { validate: !checkValidate(obj) }
        },
      },
      {
        label: '驳回',
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
          return {
            validate: obj.process_instance.process_definition_key !== WORKFLOW_TYPES.CUSTOMER_SERVICE,
          }
        },
      },
      {
        label: '反馈',
        action: obj => {
          this.createDialog('WorkflowFeedbackDialog', {
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
          const name = this.userInfo.name
          function checkValidate (obj) {
            if (obj.process_instance.process_definition_key !== WORKFLOW_TYPES.CUSTOMER_SERVICE) {
              return true
            } else {
              if (obj.process_instance.start_user_name === name) {
                return false
              }
            }
          }
          return { validate: !checkValidate(obj) }
        },
      },
      {
        label: '结束',
        action: obj => {
          this.createDialog('WorkflowEndDialog', {
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
          const name = this.userInfo.name
          function checkValidate (obj) {
            if (obj.process_instance.process_definition_key !== WORKFLOW_TYPES.CUSTOMER_SERVICE) {
              return true
            } else {
              if (obj.process_instance.start_user_name === name) {
                return false
              }
            }
          }
          return { validate: !checkValidate(obj) }
        },
      },
    ]
  },
}
