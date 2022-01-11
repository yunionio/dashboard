import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('system.text_326', [i18n.t('dictionary.project')]),
        action: obj => {
          this.handleOpenSidepage(obj, 'project-list')
        },
        meta: obj => {
          const ret = {
            validate: true,
          }
          return ret
        },
      },
      {
        label: i18n.t('system.text_326', [i18n.t('dictionary.user')]),
        action: obj => {
          this.handleOpenSidepage(obj, 'user-list')
        },
        meta: obj => {
          const ret = {
            validate: true,
          }
          return ret
        },
      },
      {
        label: i18n.t('system.text_129'),
        permission: 'groups_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('system.text_129'),
            onManager: this.onManager,
            name: this.$t('dictionary.group'),
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
