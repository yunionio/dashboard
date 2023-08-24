import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('system.text_479'),
        permission: 'users_update',
        action: row => {
          this.createDialog('UserUpdateDialog', {
            data: [row],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
      },
      {
        label: i18n.t('system.text_153'),
        actions: row => {
          return [
            ...getEnabledSwitchActions(this, row, ['users_perform_enable', 'users_perform_disable'], {
              actions: [
                () => {
                  this.onManager('update', {
                    id: row.id,
                    managerArgs: {
                      data: {
                        enabled: true,
                      },
                    },
                  })
                },
                () => {
                  this.onManager('update', {
                    id: row.id,
                    managerArgs: {
                      data: {
                        enabled: false,
                      },
                    },
                  })
                },
              ],
            }),
            {
              label: i18n.t('compute.text_276'),
              permission: 'users_update',
              action: () => {
                this.createDialog('UserUpdatePasswordDialog', {
                  data: [row],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: () => {
                const { idps } = row
                if (idps && idps.length > 0) {
                  const [{ idp_driver }] = idps
                  if (idp_driver === 'ldap') {
                    return {
                      validate: false,
                      tooltip: this.$t('common_603'),
                    }
                  }
                }
                if (!row.is_local) return { validate: false }
                return {
                  validate: true,
                }
              },
            },
            {
              label: i18n.t('common_493'),
              action: () => {
                this.handleOpenSidepage(row, 'projects')
              },
            },
            {
              label: `${i18n.t('common.reset')}MFA`,
              action: () => {
                this.createDialog('ResetMFADialog', {
                  data: [row],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
            },
            {
              label: i18n.t('system.text_129'),
              permission: 'users_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [row],
                  columns: this.columns,
                  title: i18n.t('system.text_480'),
                  name: this.$t('dictionary.user'),
                  onManager: this.onManager,
                  alert: {
                    message: i18n.t('system.text_513'),
                    type: 'error',
                  },
                  refresh: this.refresh,
                })
              },
              meta: () => this.$getDeleteResult(row),
            },
          ]
        },
      },
    ]
  },
}
