export default {
  created () {
    this.singleActions = [
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
