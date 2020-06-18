export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.delete'),
        permission: 'cloudgroupcache_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('common.delete'),
            name: this.$t('dictionary.cloudgroupcache'),
            onManager: this.onManager,
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}
