import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_383'),
        permission: 'dynamicschedtags_update',
        action: (obj) => {
          this.createDialog('UpdateDynamicschedtagDialog', {
            data: [obj],
            columns: this.columns,
            title: i18n.t('cloudenv.text_383'),
            onManager: this.onManager,
          })
        },
      },
      {
        label: i18n.t('cloudenv.text_311'),
        actions: obj => {
          return [
            {
              label: i18n.t('cloudenv.text_334'),
              permission: 'dynamicschedtags_update',
              action: obj => {
                this.onManager('update', {
                  id: obj.id,
                  managerArgs: {
                    data: { enabled: true },
                  },
                })
              },
              meta: obj => {
                return {
                  validate: !obj.enabled,
                }
              },
            },
            {
              label: i18n.t('cloudenv.text_335'),
              permission: 'dynamicschedtags_update',
              action: obj => {
                this.onManager('update', {
                  id: obj.id,
                  managerArgs: {
                    data: { enabled: false },
                  },
                })
              },
              meta: obj => {
                return {
                  validate: obj.enabled,
                }
              },
            },
            {
              label: i18n.t('cloudenv.text_108'),
              permission: 'dynamicschedtags_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('cloudenv.text_379'),
                  name: this.$t('dictionary.dynamicschedtag'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                return {
                  validate: obj.can_delete,
                }
              },
            },
          ]
        },
      },
    ]
  },
}
