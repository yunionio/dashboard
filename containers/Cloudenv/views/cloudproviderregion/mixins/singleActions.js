import i18n from '@/locales'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  created () {
    this.pM = new this.$Manager('cloudproviders')
    const ownerDomain = obj => this.$store.getters.isAdminMode || obj.cloudaccount_domain_id === this.$store.getters.userInfo.projectDomainId
    this.singleActions = [
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
      {
        label: i18n.t('compute.text_352'),
        actions: (obj) => {
          return [
            ...getEnabledSwitchActions(this, undefined, undefined, {
              actions: [
                async (obj) => {
                  await this.pM.performAction({
                    id: this.cloudproviderId,
                    action: 'set-syncing',
                    data: {
                      cloudregion_ids: [obj.cloudregion_id],
                      enabled: true,
                    },
                  })
                  this.refresh()
                },
                async (obj) => {
                  await this.pM.performAction({
                    id: this.cloudproviderId,
                    action: 'set-syncing',
                    data: {
                      cloudregion_ids: [obj.cloudregion_id],
                      enabled: false,
                    },
                  })
                  this.refresh()
                },
              ],
              fields: ['cloudregion', 'enabled', 'last_auto_sync'],
              metas: [
                () => ({
                  validate: !obj.enabled && ownerDomain(obj),
                }),
                () => ({
                  validate: obj.enabled && ownerDomain(obj),
                }),
              ],
            }),
          ]
        },
      },
    ]
  },
}
