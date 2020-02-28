import { RollbackDiskValidate } from '../validate'

export default {
  created () {
    if (this.mixinType === 'disk') {
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
          label: '删除',
          action: obj => {
            this.createDialog('DeleteResDialog', {
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
    }
    if (this.mixinType === 'instance') {
      this.singleActions = [
        {
          label: '删除',
          action: obj => {
            this.createDialog('DeleteResDialog', {
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
    }
  },
}
