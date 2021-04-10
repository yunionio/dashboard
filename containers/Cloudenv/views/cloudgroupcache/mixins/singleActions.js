export default {
  props: {
    isOwner: Function,
  },
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
        meta: (obj) => {
          if (this.isOwner && !this.isOwner()) {
            return {
              validate: false,
              tooltip: this.$t('common_614'),
            }
          }
          return this.$getDeleteResult(obj)
        },
      },
    ]
  },
}
