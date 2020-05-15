import { RollbackDiskValidate } from '../validate'

export default {
  created () {
    this.singleActions = [
      {
        label: '回滚硬盘',
        permission: 'disks_perform_disk_reset',
        action: obj => {
          this.createDialog('DiskRollbackDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          const brand = obj.brand && obj.brand.toLowerCase()
          if (!obj.disk_name) {
            return { validate: false }
          }
          if (brand && RollbackDiskValidate[brand]) {
            return { ...RollbackDiskValidate[brand](obj) }
          }
          return { validate: true }
        },
      },
      {
        label: '同步状态',
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['running', 'ready'],
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
        label: '删除',
        permission: 'snapshots_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除',
            onManager: this.onManager,
            name: '快照',
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
