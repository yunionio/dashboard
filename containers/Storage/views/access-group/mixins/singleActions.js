import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('storage.text_100'),
        permission: 'access_groups_perform_syncstatus',
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['available'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: () => ({
          validate: true,
        }),
      },
      {
        label: i18n.t('storage.text_65'),
        actions: (obj) => {
          return [
            {
              label: i18n.t('storage.text_36'),
              permission: 'access_groups_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('storage.text_36'),
                  name: this.$t('dictionary.access_group'),
                  alert: this.$t('storage.text_266'),
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
