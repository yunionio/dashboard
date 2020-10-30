import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_555'),
        action: obj => {
          const { id, policies, category } = obj
          this.$router.push({
            path: '/strategydefinition/create',
            query: {
              type: 'assign',
              id,
              policies,
              category,
            },
          })
        },
      },
      {
        label: i18n.t('cloudenv.text_554'),
        action: obj => {
          const { id, name, policies, category } = obj
          this.$router.push({
            path: '/strategydefinition/create',
            query: {
              type: 'edit',
              id,
              name,
              policies,
              category,
            },
          })
        },
      },
      {
        label: i18n.t('cloudenv.text_108'),
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('cloudenv.text_108'),
            name: this.$t('dictionary.strategydefinition'),
            onManager: this.onManager,
            success: () => {
              this.destroySidePages()
            },
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}
