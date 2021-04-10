import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('storage.text_100'),
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
              permission: 'mount_target_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('storage.text_36'),
                  name: this.$t('dictionary.mount_target'),
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
