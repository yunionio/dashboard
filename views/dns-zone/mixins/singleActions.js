import { getSetPublicAction, getDomainChangeOwnerAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('network.text_719'),
        action: (obj) => {
          this.createDialog('AssociateVpcDialog', {
            title: this.$t('network.text_719'),
            data: [obj],
            resData: obj,
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: (obj) => {
          const ret = { validate: true }
          if (obj.zone_type === 'PublicZone') {
            ret.validate = false
            ret.tooltip = i18n.t('common_662')
          }
          return ret
        },
      },
      {
        label: this.$t('network.text_129'),
        actions: obj => {
          return [
            getSetPublicAction(this, {
              name: this.$t('dictionary.dnszone'),
              scope: 'domain',
              resource: 'dns_zones',
            }),
            {
              label: this.$t('network.text_201'),
              action: () => {
                this.onManager('performAction', {
                  steadyStatus: ['available'],
                  id: obj.id,
                  managerArgs: {
                    action: 'syncstatus',
                  },
                })
              },
              meta: () => ({
                validate: true,
              }),
            },
            {
              label: this.$t('network.text_721'),
              action: () => {
                this.onManager('performAction', {
                  steadyStatus: ['available'],
                  id: obj.id,
                  managerArgs: {
                    action: 'sync-recordsets',
                  },
                })
              },
              meta: () => {
                return {
                  validate: !['sync_record_sets'].includes(obj.status),
                }
              },
            },
            getDomainChangeOwnerAction(this, {
              name: this.$t('dictionary.dnszone'),
              resource: 'dns_zones',
            }),
            {
              label: this.$t('network.text_131'),
              permission: 'dns_zones_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: this.$t('network.text_131'),
                  name: this.$t('dictionary.dnszone'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}
