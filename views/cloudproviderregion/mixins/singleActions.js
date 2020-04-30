
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
      {
        label: '全量同步',
        action: obj => {
          new this.$Manager('cloudproviders').performAction({
            id: obj.cloudprovider_id,
            action: 'sync',
            data: {
              region: [
                obj.cloudregion_id,
              ],
            },
          }).then(() => {
            this.list.refresh()
          })
        },
        meta: obj => {
          const isIdle = obj.sync_status === 'idle'
          return {
            validate: isIdle,
            tooltip: !isIdle && `${this.$t('status.cloudaccountSyncStatus')[obj.sync_status]}状态下不支持此操作`,
          }
        },
      },
    ]
  },
}
