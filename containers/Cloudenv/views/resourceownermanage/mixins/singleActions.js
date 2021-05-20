import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_590'),
        permission: 'proxysettings_update',
        action: (row) => {
          this.createSidePage('ResourceOwnerManageDetail', {
            data: [row],
            columns: this.columns,
            title: i18n.t('cloudenv.text_406'),
            onManager: this.onManager,
          })
        },
        // meta: this.commonMeta,
        meta: {
          validate: true,
        },
      },
      {
        label: i18n.t('cloudenv.text_311'),
        actions: obj => {
          // const ownerDomain = this.isAdminMode || obj.domain_id === this.userInfo.projectDomainId
          return [
            ...getEnabledSwitchActions(this, obj, ['cloudaccounts_perform_enable', 'cloudaccounts_perform_disable'], {
              metas: [
                () => {
                  return {
                    // validate: !obj.enabled && ownerDomain,
                    validate: true,
                  }
                },
                () => {
                  return {
                    // validate: obj.enabled && ownerDomain,
                    validate: true,
                  }
                },
              ],
            }),
            {
              label: i18n.t('cloudenv.text_108'),
              permission: 'cloudaccounts_delete',
              action: () => {
                const supportBill = ['Aws', 'Aliyun', 'Google', 'Huawei', 'Azure', 'Qcloud'].includes(obj.brand)
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('cloudenv.text_109'),
                  name: this.$t('dictionary.cloudaccount'),
                  onManager: this.onManager,
                  content: () => {
                    if (supportBill) {
                      return <a-checkbox v-model={ this.deleteBill }>{ this.$t('cloudenv.text_497') }</a-checkbox>
                    }
                    return null
                  },
                  success: async () => {
                    if (supportBill && this.deleteBill) {
                      const manager = new this.$Manager('bill_tasks', 'v1')
                      try {
                        const data = {
                          task_type: 'bill_remove',
                          cloudaccount_id: obj.id,
                        }
                        await manager.create({
                          data,
                        })
                      } catch (err) {
                        throw err
                      }
                    }
                    this.deleteBill = true
                  },
                  cancel: () => {
                    this.deleteBill = true
                  },
                })
              },
              meta: () => {
                const deleteResult = this.$getDeleteResult(obj)
                if (!deleteResult.validate) {
                  return deleteResult
                }
                return {
                  // validate: ownerDomain,
                  validate: true,
                }
              },
            },
          ]
        },
      },
    ]
  },
  methods: {
    commonMeta (row = {}, action) {
      const { id } = row
      const isDirect = id === 'DIRECT'
      if (!row.can_delete && action === 'delete') {
        return {
          validate: false,
          tooltip: i18n.t('cloudenv.text_412'),
        }
      }
      if (isDirect) {
        return {
          validate: false,
          tooltip: i18n.t('cloudenv.text_404'),
        }
      }
      const { isDomainMode, userInfo } = this.$store.getters
      if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
        return {
          validate: false,
          tooltip: i18n.t('cloudenv.text_405'),
        }
      }
      return {
        isDirect,
        validate: true,
      }
    },
  },
}
