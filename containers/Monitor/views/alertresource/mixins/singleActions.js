import { mapGetters } from 'vuex'
import { isCE } from '@/utils/utils'
export default {
  computed: {
    ...mapGetters(['workflow']),
  },
  created () {
    this.singleActions = [
      {
        label: this.$t('monitor.convert_to_ticket'),
        action: (obj) => {
          const activeKeys = []
          const enabledKeys = []
          if ((this.workflow.enabledKeys || []).includes('alert-event')) {
            enabledKeys.push('alert-event')
            if (!obj.alert_event_instance_id) {
              activeKeys.push('alert-event')
            }
          }
          if ((this.workflow.enabledKeys || []).includes('alert-ticket')) {
            enabledKeys.push('alert-ticket')
            if (!obj.alert_ticket_instance_id) {
              activeKeys.push('alert-ticket')
            }
          }
          this.createDialog('AlertResourceConvertToTicketDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            activeKeys,
            enabledKeys,
            refresh: this.refresh,
          })
        },
        meta: (obj) => {
          const activeKeys = []
          const enabledKeys = []
          if ((this.workflow.enabledKeys || []).includes('alert-event')) {
            enabledKeys.push('alert-event')
            if (!obj.alert_event_instance_id) {
              activeKeys.push('alert-event')
            }
          }
          if ((this.workflow.enabledKeys || []).includes('alert-ticket')) {
            enabledKeys.push('alert-ticket')
            if (!obj.alert_ticket_instance_id) {
              activeKeys.push('alert-ticket')
            }
          }
          return {
            validate: activeKeys.length !== 0,
            tooltip: this.$t('monitor.converted_ticket'),
          }
        },
        hidden: (obj) => {
          if (isCE() || this.$store.getters.isSysCE) return true
          if (!(this.workflow.enabledKeys || []).includes('alert-event') && !(this.workflow.enabledKeys || []).includes('alert-ticket')) return true
          return false
        },
      },
      {
        label: this.$t('common.view_action', [this.$t('monitor.text_0')]),
        action: (obj) => {
          if (obj.data) {
            obj.eval_data = [obj.data]
          }
          this.createDialog('ViewMonitorDialog', {
            vm: this,
            title: this.$t('common.view_action', [this.$t('monitor.text_0')]),
            columns: this.columns,
            onManager: this.onManager,
            data: [obj],
          })
        },
      },
      {
        label: this.$t('monitor.alerts.shield.shield'),
        permission: 'alertrecordshields_create',
        action: (obj) => {
          this.createDialog('ShieldAlertrecord', {
            vm: this,
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
            data: [obj],
          })
        },
        meta: (obj) => {
          const ret = {
            validate: true,
          }
          if (obj.is_set_shield === true) {
            return {
              validate: false,
              tooltip: this.$t('monitor.alerts.shield.tips2'),
            }
          }
          return ret
        },
      },
    ]
  },
}
