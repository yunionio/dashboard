import { diskResizeConfig, diskCreateSnapshotConfig } from '@Compute/views/disk/utils'
const supportShpolcyBrand = ['OneCloud', 'Qcloud', 'Aliyun']

export default {
  created () {
    this.singleActions = [
      {
        label: '扩容',
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
        label: '更多',
        actions: obj => {
          return [
            {
              label: '挂载',
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
                    ret.tooltip = '本地硬盘不允许挂载'
                    return ret
                  }
                  ret.validate = !obj.guest && obj.status === 'ready'
                  if (obj.guest) {
                    ret.tooltip = '该磁盘已挂载'
                  } else {
                    if (obj.status === 'ready') {
                      ret.tooltip = ''
                    } else {
                      ret.tooltip = '磁盘状态为 ready 时才可以挂载'
                    }
                  }
                  return ret
                }
                ret.validate = true
                return ret
              },
            },
            {
              label: '卸载',
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
                if (!obj.guest) {
                  return {
                    validate: !!obj.guest,
                    tooltip: '请先挂载',
                  }
                }
                if (obj.cloud_env === 'onpremise' && obj.storage_type === 'local') {
                  return {
                    validate: false,
                    tooltip: '本地盘不支持卸载',
                  }
                }
                if (obj.disk_type === 'sys') {
                  return {
                    validate: false,
                    tooltip: '系统盘不支持卸载',
                  }
                } else {
                  if (obj.portable && obj.portable === false) {
                    return {
                      validate: false,
                      tooltip: '该磁盘类型不允许卸载',
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
              label: '新建快照',
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
              label: '设置自动快照',
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
                    tooltip: '状态不可用的磁盘不支持该操作',
                  }
                }
                if (obj.brand) {
                  const brand = obj.brand.toLowerCase()
                  if (brand === 'vmware') {
                    return {
                      validate: false,
                      tooltip: 'VMware暂不支持该操作',
                    }
                  }
                  if (brand === 'ctyun') {
                    return {
                      validate: false,
                      tooltip: '天翼云暂不支持该操作',
                    }
                  }
                  if (brand === 'openstack') {
                    if (obj.storage_type !== 'local' && obj.storage_type !== 'iscsi') {
                      return {
                        validate: false,
                        tooltip: '私有云非本地盘不支持该操作',
                      }
                    }
                  } else {
                    if (!obj.guest_count) {
                      return {
                        validate: false,
                        tooltip: '未挂载的磁盘不支持该操作',
                      }
                    }
                  }
                  if (brand === 'ucloud') {
                    if (obj.storage_type !== 'CLOUD_NORMAL') {
                      return {
                        validate: false,
                        tooltip: '只有存储类型为CLOUD_NORMAL的支持该操作',
                      }
                    }
                  }
                }
                if (obj.guest_status !== 'running' && obj.guest_status !== 'ready') {
                  return {
                    validate: false,
                    tooltip: '主机状态异常不支持该操作',
                  }
                }
                if (!supportShpolcyBrand.includes(obj.brand)) {
                  return {
                    validate: false,
                    tooltip: `设置自动快照仅支持${supportShpolcyBrand.join('、')}`,
                  }
                }
                if (obj.snapshotpolicy_status === 'deleting' || obj.snapshotpolicy_status === 'init') {
                  return {
                    validate: false,
                    tooltip: '自动快照策略解绑中，请稍后重试',
                  }
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: `更改${this.$t('dictionary.project')}`,
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  resource: 'disks',
                })
              },
              meta: () => ({
                validate: obj.guest_count < 1,
                tooltip: obj.guest ? `已挂载的硬盘不可以更改${this.$t('dictionary.project')}，请卸载后重试` : '',
              }),
            },
            {
              label: '同步状态',
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
              label: '删除',
              permission: 'disks_delete',
              action: () => {
                this.createDialog('DiskDeleteDialog', {
                  data: [obj],
                  columns: this.columns,
                  title: '删除',
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
                  ret.tooltip = '包年包月硬盘不支持删除'
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
