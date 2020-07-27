import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.text_234'),
        action: (obj) => {
          this.onManager('performAction', {
            steadyStatus: ['succeeded', 'failed'],
            id: obj.id,
            managerArgs: {
              action: 'run',
            },
          })
        },
        meta: obj => {
          const { status } = obj
          const isRun = status === 'running'
          return {
            validate: !isRun,
            tooltip: isRun && i18n.t('compute.text_235'),
          }
        },
      },
      {
        label: i18n.t('compute.text_236'),
        action: (obj) => {
          this.createDialog('AnsiblePlayBookStopDialog', {
            title: i18n.t('compute.text_236'),
            data: [obj],
            onManager: this.onManager,
            columns: this.columns,
          })
        },
        meta: obj => {
          const { status } = obj
          const isRun = status === 'running'
          return {
            validate: isRun,
            tooltip: !isRun && i18n.t('compute.text_237'),
          }
        },
      },
    ]
  },
}
