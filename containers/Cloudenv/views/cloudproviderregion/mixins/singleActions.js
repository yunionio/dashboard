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
        label: i18n.t('common.sync_resource'),
        permission: 'cloudaccounts_perform_sync',
        action: obj => {
          this.createDialog('FullSyncResourceDialog', {
            title: this.$t('common.sync_resource'),
            name: this.$t('cloudenv.text_10'),
            action: this.$t('common.sync_resource'),
            steadyStatus: this.list.steadyStatus,
            data: [obj],
            columns: this.columns,
            callback: () => {
              this.list.refresh()
            },
          })
        },
        meta: obj => {
          const isIdle = obj.sync_status === 'idle'
          if (obj.enable_auto_sync && obj.cloudprovider_sync_status !== 'idle') {
            return {
              validate: false,
              tooltip: i18n.t('cloudenv.text_313'),
            }
          }
          return {
            validate: isIdle,
            tooltip: !isIdle && i18n.t('cloudenv.text_368', [this.$t('status.cloudaccountSyncStatus')[obj.sync_status]]),
          }
        },
      },
    ]
  },
}
