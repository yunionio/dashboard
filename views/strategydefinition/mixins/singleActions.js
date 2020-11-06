import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_554'),
        permission: 'scopedpolicies_update',
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
        label: i18n.t('cloudenv.text_555'),
        permission: 'scopedpolicies_update',
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
        label: i18n.t('cloudenv.text_108'),
        permission: 'scopedpolicies_delete',
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
