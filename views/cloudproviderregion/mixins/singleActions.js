import i18n from '@/locales'

export default {
  created () {
    const ownerDomain = obj => this.$store.getters.isAdminMode || obj.cloudaccount_domain_id === this.$store.getters.userInfo.projectDomainId
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_363'),
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
        label: i18n.t('cloudenv.text_105'),
        permission: 'cloudaccounts_perform_sync',
        action: obj => {
          new this.$Manager('cloudproviders').performAction({
            id: obj.cloudprovider_id,
            action: 'sync',
            data: {
              region: [
                obj.cloudregion_id,
              ],
            },
            params: {
              full_sync: true,
              force: true,
            },
          }).then(() => {
            this.list.refresh()
            this.$message.success(i18n.t('cloudenv.text_367'))
          })
        },
        meta: obj => {
          const isIdle = obj.sync_status === 'idle'
          return {
            validate: isIdle,
            tooltip: !isIdle && i18n.t('cloudenv.text_368', [this.$t('status.cloudaccountSyncStatus')[obj.sync_status]]),
          }
        },
      },
    ]
  },
}
