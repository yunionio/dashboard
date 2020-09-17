import { getSetPublicAction, getDomainChangeOwnerAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('network.text_719'),
        permission: 'dns_zones_add_vpcs',
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
          const ret = { validate: true, tooltip: '' }
          if (obj.zone_type === 'PublicZone') {
            ret.validate = false
            ret.tooltip = i18n.t('common_662')
            return ret
          }
          if (obj.status !== 'available') {
            ret.validate = false
            ret.tooltip = i18n.t('network.text_730')
            return ret
          }
          return ret
        },
      },
      {
        label: this.$t('network.text_129'),
        permission: 'dns_zones_syncstatus',
        actions: obj => {
          return [
            getSetPublicAction(this, {
              name: this.$t('dictionary.dns_zone'),
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
              permission: 'dns_zones_sync_recordsets',
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
              name: this.$t('dictionary.dns_zone'),
              resource: 'dns_zones',
            }),
            {
              label: this.$t('network.text_131'),
              permission: 'dns_zones_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: this.$t('network.text_131'),
                  name: this.$t('dictionary.dns_zone'),
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
