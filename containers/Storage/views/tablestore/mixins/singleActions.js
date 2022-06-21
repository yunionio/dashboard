import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('storage.text_100'),
        permission: 'tablestores_perform_syncstatus',
        action: (row) => {
          this.onManager('performAction', {
            steadyStatus: ['running'],
            id: row.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: row => {
          return {
            validate: row.status !== 'sync_status',
          }
        },
      },
    ]
  },
}
