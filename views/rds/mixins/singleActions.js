import { disableDeleteAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: '同步状态',
        action: (obj) => {
          this.onManager('performAction', {
            steadyStatus: 'running',
            id: obj.id,
            managerArgs: {
              action: 'sync-status',
            },
          }).then(ret => {
            if (ret.status === 200) {
              this.$message.success('操作成功')
            }
          })
        },
      },
      {
        label: '更多',
        actions: (obj) => {
          const isRunning = obj.status.toLowerCase() === 'running'
          const notRunninTip = !isRunning ? '仅运行中的实例支持此操作' : null
          return [
            {
              label: `更改${this.$t('dictionary.project')}`,
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  title: `更改${this.$t('dictionary.project')}`,
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.dbinstances'),
                })
              },
            },
            {
              label: '重启',
              action: () => {
                this.createDialog('RDSRestartdialog', {
                  title: '重启',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                return {
                  validate: isRunning,
                  tooltip: notRunninTip,
                }
              },
            },
            {
              label: '续费',
              action: () => {
                this.createDialog('RedisRenewDialog', {
                  title: '续费',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const isPrepaid = obj.billing_type === 'prepaid'
                const validate = (isRunning && isPrepaid)
                return {
                  validate: validate,
                  tooltip: notRunninTip || (!isPrepaid ? '仅包年包月的实例支持此操作' : null),
                }
              },
            },
            {
              label: '调整配置',
              action: () => {
                this.createDialog('RSDSetConfig', {
                  title: '调整配置',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                return {
                  validate: isRunning,
                  tooltip: notRunninTip,
                }
              },
            },
            disableDeleteAction(this, {
              name: this.$t('dictionary.dbinstances'),
            }),
            {
              label: '删除',
              permission: 'rds_dbinstances_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: '删除',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.dbinstances'),
                })
              },
              meta: () => {
                let tooltip = ''
                let seconds = this.$moment(obj.expired_at).diff(new Date()) / 1000
                if (obj.disable_delete) {
                  tooltip = '请点击修改属性禁用删除保护后重试'
                } else if (obj.billing_type === 'prepaid' && seconds > 0) {
                  tooltip = '实例未到期不允许删除'
                }
                return {
                  validate: !tooltip,
                  tooltip: tooltip,
                }
              },
            },
          ]
        },
      },
    ]
  },
}
