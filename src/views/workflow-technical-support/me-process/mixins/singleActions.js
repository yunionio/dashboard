import i18n from '@/locales'
import { CLOSE_STATUS } from '../../constants'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.workflow.browse'),
        action: (obj) => {
          this.$router.push({
            name: 'WorkflowTechnicalSupportBrowse',
            query: {
              id: obj.id,
              type: 'me-process',
            },
          })
        },
      },
      {
        label: i18n.t('common_356'),
        action: obj => {
          this.createDialog('WorkflowSupportEndDialog', {
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
          const ret = { validate: true }
          if (CLOSE_STATUS.includes(obj.state)) {
            ret.validate = false
            ret.tooltip = i18n.t('common.workflow.end_tips')
          }
          return ret
        },
      },
    ]
  },
}
