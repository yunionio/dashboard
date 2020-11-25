import { diskResizeConfig, diskCreateSnapshotConfig } from '@Compute/views/disk/utils'
import i18n from '@/locales'
import { BRAND_MAP } from '@/constants'
const supportShpolcyBrand = ['OneCloud', 'Qcloud', 'Aliyun']

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.text_402'),
        permission: 'disks_perform_resize',
        action: obj => {
          this.createDialog('DiskCapacityUpdateDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          const provider = obj.provider.toLowerCase()
          if (diskResizeConfig[provider]) {
            return {
              validate: diskResizeConfig[provider](obj).validate,
              tooltip: diskResizeConfig[provider](obj).tooltip,
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('compute.text_352'),
        actions: obj => {
          return [
            {
              label: i18n.t('compute.text_424'),
              permission: 'disks_perform_attachdisk',
              action: () => {
                this.createDialog('DiskMountUpdateDialog', {
                  data: [obj],
                  columns: this.columns,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: '',
                }
                if (obj.cloud_env === 'onpremise' || obj.cloud_env === 'private' || obj.cloud_env === 'public') {
                  if (obj.storage_type === 'local') {
                    ret.tooltip = i18n.t('compute.text_442')
                    return ret
                  }
                  ret.validate = !obj.guest && obj.status === 'ready'
                  if (obj.guest) {
                    ret.tooltip = i18n.t('compute.text_443')
                  } else {
                    if (obj.status === 'ready') {
                      ret.tooltip = ''
                    } else {
                      ret.tooltip = i18n.t('compute.text_444')
                    }
                  }
                  return ret
                }
                ret.validate = true
                return ret
              },
            },
            {
              label: i18n.t('compute.text_439'),
              permission: 'disks_perform_detachdisk',
              action: () => {
                this.createDialog('DiskUnMountUpdateDialog', {
                  data: [obj],
                  columns: this.columns,
                  list: this.list,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                if (obj.brand) {
                  const brand = obj.brand.toLowerCase()
                  if (brand === 'vmware' && obj.disk_type === 'data') {
                    return {
                      validate: false,
                      tooltip: i18n.t('compute.text_1287', [BRAND_MAP[obj.brand].label]),
                    }
                  }
                }
                if (!obj.guest) {
                  return {
                    validate: !!obj.guest,
                    tooltip: i18n.t('compute.text_445'),
                  }
                }
                if (obj.cloud_env === 'onpremise' && obj.storage_type === 'local') {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_446'),
                  }
                }
                if (obj.disk_type === 'sys') {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_447'),
                  }
                } else {
                  if (obj.portable && obj.portable === false) {
                    return {
                      validate: false,
                      tooltip: i18n.t('compute.text_448'),
                    }
                  }
                }
                return {
                  validate: true,
                  tooltip: '',
                }
              },
            },
            {
              label: i18n.t('compute.text_414'),
              permission: 'disks_perform_create_snapshot',
              action: () => {
                this.createDialog('DiskCreateSnapshotDialog', {
                  data: [obj],
                  columns: this.columns,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const provider = obj.provider.toLowerCase()
                return {
                  validate: diskCreateSnapshotConfig[provider](obj).validate,
                  tooltip: diskCreateSnapshotConfig[provider](obj).tooltip,
                }
              },
            },
            {
              label: i18n.t('compute.text_426'),
              action: () => {
                this.createDialog('DiskSetSnapshotDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                if (obj.status !== 'ready') {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_449'),
                  }
                }
                if (obj.brand) {
                  const brand = obj.brand.toLowerCase()
                  if (brand === 'vmware') {
                    return {
                      validate: false,
                      tooltip: i18n.t('compute.text_450'),
                    }
                  }
                  if (brand === 'ctyun') {
                    return {
                      validate: false,
                      tooltip: i18n.t('compute.text_451'),
                    }
                  }
                  if (brand === 'openstack') {
                    if (obj.storage_type !== 'local' && obj.storage_type !== 'iscsi') {
                      return {
                        validate: false,
                        tooltip: i18n.t('compute.text_452'),
                      }
                    }
                  } else {
                    if (!obj.guest_count) {
                      return {
                        validate: false,
                        tooltip: i18n.t('compute.text_453'),
                      }
                    }
                  }
                  if (brand === 'ucloud') {
                    if (obj.storage_type !== 'CLOUD_NORMAL') {
                      return {
                        validate: false,
                        tooltip: i18n.t('compute.text_454'),
                      }
                    }
                  }
                }
                if (obj.guest_status !== 'running' && obj.guest_status !== 'ready') {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_455'),
                  }
                }
                if (!supportShpolcyBrand.includes(obj.brand)) {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_456', [supportShpolcyBrand.join('、')]),
                  }
                }
                if (obj.snapshotpolicy_status === 'deleting' || obj.snapshotpolicy_status === 'init') {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_457'),
                  }
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: this.$t('compute.text_279', [this.$t('dictionary.project')]),
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  resource: 'disks',
                  name: i18n.t('compute.text_100'),
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: '',
                }
                if (this.isProjectMode) {
                  ret.tooltip = this.$t('compute.text_1279', [this.$t('dictionary.domain')])
                  return ret
                }
                return {
                  validate: obj.guest_count < 1,
                  tooltip: obj.guest ? i18n.t('compute.text_458', [i18n.t('dictionary.project')]) : '',
                }
              },
            },
            {
              label: i18n.t('compute.text_282'),
              permission: 'disks_perform_syncstatus',
              action: () => {
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
              label: i18n.t('compute.text_261'),
              permission: 'disks_delete',
              action: () => {
                this.createDialog('DiskDeleteDialog', {
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('compute.text_261'),
                  onManager: this.onManager,
                  success: () => {
                    this.destroySidePages()
                  },
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: null,
                }
                if (obj.billing_type === 'prepaid') {
                  ret.tooltip = i18n.t('compute.text_460')
                  return ret
                }
                return this.$getDeleteResult(obj)
              },
            },
          ]
        },
      },
    ]
  },
}
