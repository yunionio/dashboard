
export default {
  created () {
    const ownerDomain = obj => this.$store.getters.isAdminMode || obj.domain_id === this.$store.getters.userInfo.projectDomainId
    this.singleActions = [
      {
        label: '设置同步',
        action: obj => {
          this.createDialog('cloudproviderregionsSetAutoSyncDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
            cloudproviderId: this.cloudproviderId,
          })
        },
        meta: obj => {
          return {
            validate: ownerDomain(obj),
          }
        },
      },
    ]
  },
}
