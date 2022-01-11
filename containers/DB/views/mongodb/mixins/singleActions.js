import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('db.text_69'),
        action: (obj) => {
          this.onManager('performAction', {
            id: obj.id,
            steadyStatus: 'running',
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
      },
      {
        label: i18n.t('db.text_155'),
        actions: (obj) => {
          return [
            {
              label: i18n.t('common_277'),
              action: (row) => {
                this.createDialog('ChangeDisableDelete', {
                  name: this.$t('dictionary.mongodb'),
                  columns: this.columns,
                  onManager: this.onManager,
                  data: [row],
                })
              },
            },
            {
              label: i18n.t('db.text_42'),
              permission: 'mongodb_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('db.text_42'),
                  name: this.$t('dictionary.mongodb'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}
