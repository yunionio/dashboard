import { mapGetters } from 'vuex'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'
export default {
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  },
  created () {
    this.singleActions = [
      // 修改
      {
        label: i18n.t('system.text_152'),
        permission: 'subscribers_update',
        action: (obj) => {
          this.createDialog('SetupNotifyReceiverDialog', {
            data: obj,
            columns: this.columns,
            success: (res) => {
              this.list.fetchData()
            },
          })
        },
      },
      {
        label: i18n.t('system.text_153'),
        actions: obj => {
          return [
            // 启用禁用
            ...getEnabledSwitchActions(this, obj, ['subscribers_enable', 'subscribers_disable'], {
              resourceName: this.$t('system.notify.subscriber.receivers'),
              fields: ['resource_scope', 'enabled', 'type', 'receivers'],
              metas: [
                () => { return { validate: !obj.enabled } },
                () => { return { validate: obj.enabled } },
              ],
              actions: [
                async (obj) => {
                  await this.onManager('batchPerformAction', {
                    id: [obj.id],
                    managerArgs: {
                      action: 'enable',
                    },
                  })
                },
                async (obj) => {
                  await this.onManager('batchPerformAction', {
                    id: [obj.id],
                    managerArgs: {
                      action: 'disable',
                    },
                  })
                },
              ],
            }),
            // 删除
            {
              label: i18n.t('system.text_129'),
              permission: 'subscribers_delete',
              action: (obj) => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('common.delete'),
                  name: this.$t('system.notify.subscriber.receivers'),
                  onManager: this.onManager,
                })
              },
              meta: (row) => {
                const ret = {
                  validate: true,
                }
                if (!row.can_delete) {
                  ret.validate = false
                }
                return ret
              },
            },
          ]
        },
        meta: (row) => {
          const ret = {
            validate: true,
          }
          return ret
        },
      },
    ]
  },
}
