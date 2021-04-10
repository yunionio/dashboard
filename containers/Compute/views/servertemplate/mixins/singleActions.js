import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.text_1047', [i18n.t('dictionary.server')]),
        permission: 'server_create',
        action: obj => {
          this.$router.push({
            path: '/servertemplate/create-server',
            query: {
              id: obj.id,
            },
          })
        },
        meta: obj => {
          const isReady = obj.status === 'ready'
          return {
            validate: isReady,
            tooltip: !isReady && i18n.t('compute.text_1048'),
          }
        },
      },
      {
        label: i18n.t('compute.text_261'),
        permission: 'servertemplates_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.text_261'),
            onManager: this.onManager,
            name: this.$t('dictionary.servertemplate'),
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
