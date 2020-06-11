export default {
  created () {
    this.singleActions = [
      // {
      //   label: this.$t('cloudenv.cloudgroup_single_action1'),
      //   permission: 'cloudgroup_perform_add_user',
      //   action: (obj) => {
      //     this.createDialog('CloudgroupAddUserDialog', {
      //       data: [obj],
      //       onManager: this.onManager,
      //       columns: this.columns,
      //     })
      //   },
      //   meta: (obj) => {
      //     return {
      //       validate: obj.status === 'available',
      //     }
      //   },
      // },
      {
        label: this.$t('cloudenv.cloudgroup_single_action2'),
        permission: 'cloudgroup_perform_set_policy',
        action: (obj) => {
          this.createDialog('CloudgroupSetPolicyDialog', {
            data: [obj],
            onManager: this.onManager,
            columns: this.columns,
            success: () => {
              this.$bus.$emit('CloudpolicyListForCloudgroupSidepageRefresh')
            },
          })
        },
        meta: (obj) => {
          return {
            validate: obj.status === 'available',
          }
        },
      },
      {
        label: this.$t('common.delete'),
        permission: 'cloudgroup_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('cloudenv.cloudgroup_delete_tip'),
            name: this.$t('dictionary.cloudgroup'),
            onManager: this.onManager,
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}
