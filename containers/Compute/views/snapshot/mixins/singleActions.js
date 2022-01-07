import i18n from '@/locales'
import { RollbackDiskValidate } from '../validate'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.text_1069'),
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
        label: i18n.t('compute.perform_sync_status'),
        permission: 'snapshots_perform_syncstatus',
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
        label: i18n.t('compute.perform_delete'),
        permission: 'snapshots_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.perform_delete'),
            onManager: this.onManager,
            name: i18n.t('compute.text_462'),
          })
        },
        meta: obj => {
          const ret = { validate: true }
          if (obj.guest_status === 'disk_reset') {
            ret.validate = false
            ret.tooltip = this.$t('compute.text_1347')
            return ret
          }
          return this.$getDeleteResult(obj)
        },
      },
    ]
  },
}
