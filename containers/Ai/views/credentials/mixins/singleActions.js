import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('scope.text_19'),
        action: (obj) => {
          this.onManager('update', {
            id: obj.id,
            managerArgs: {
              data: {
                enabled: true,
              },
            },
          })
        },
        meta: (obj) => {
          return {
            validate: !obj.enabled,
          }
        },
      },
      {
        label: i18n.t('scope.text_20'),
        action: (obj) => {
          this.onManager('update', {
            id: obj.id,
            managerArgs: {
              data: {
                enabled: false,
              },
            },
          })
        },
        meta: (obj) => {
          return {
            validate: obj.enabled,
          }
        },
      },
      {
        label: i18n.t('scope.text_18'),
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('scope.text_18'),
            name: this.$t('common_631'),
            onManager: this.onManager,
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}
