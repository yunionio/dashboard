import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      // {
      //   label: i18n.t('system.text_172'),
      //   action: (obj) => {
      //     this.sidePageTriggerHandle(this, 'DomainSidePage', {
      //       id: obj.id,
      //       resource: 'domains',
      //       apiVersion: 'v1',
      //     }, { tab: 'quota' })
      //   },
      //   meta: (obj) => ({
      //     validate: true,
      //   }),
      // },
      {
        label: i18n.t('system.text_153'),
        actions: (row) => {
          return [
            ...getEnabledSwitchActions(this, row, ['domains_perform_enable', 'domains_perform_disable'], {
              actions: [
                () => {
                  this.onManager('batchUpdate', {
                    id: [row.id],
                    managerArgs: {
                      data: {
                        enabled: true,
                      },
                    },
                  })
                },
                () => {
                  this.onManager('batchUpdate', {
                    id: [row.id],
                    managerArgs: {
                      data: {
                        enabled: false,
                      },
                    },
                  })
                },
              ],
            }),
            // {
            //   label: '克隆',
            //   action: () => {
            //     this.$router.push(`/domain/create?domain=${row.id}`)
            //   },
            //   meta: () => {
            //     return {
            //       validate: row.enabled,
            //     }
            //   },
            // },
            {
              label: i18n.t('system.text_129'),
              permission: 'domains_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [row],
                  columns: this.columns,
                  title: i18n.t('system.text_129'),
                  name: this.$t('dictionary.domain'),
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(row),
            },
          ]
        },
      },
    ]
    if (this.l3PermissionEnable) {
      this.singleActions.unshift({
        label: i18n.t('system.text_172'),
        action: (obj) => {
          this.sidePageTriggerHandle(this, 'DomainSidePage', {
            id: obj.id,
            resource: 'domains',
            apiVersion: 'v1',
          }, { tab: 'quota' })
        },
        meta: (obj) => ({
          validate: true,
        }),
        hidden: () => {
          return !this.globalConfig.enable_quota_check
        },
      })
    }
  },
}
