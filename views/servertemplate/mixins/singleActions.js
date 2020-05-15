export default {
  created () {
    this.singleActions = [
      {
        label: `新建${this.$t('dictionary.server')}`,
        permission: 'server_create',
        action: obj => {
          this.$router.push({
            path: '/servertemplate/create-server',
            query: {
              id: obj.id,
            },
          })
        },
      },
      {
        label: '删除',
        permission: 'servertemplates_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除',
            onManager: this.onManager,
            name: this.$t('dictionary.servertemplate'),
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
