<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { MEDIUM_MAP } from '../../../constants'
import { diskResizeConfig, diskCreateSnapshotConfig } from '../utils'
import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'

const supportShpolcyBrand = ['OneCloud', 'Qcloud', 'Aliyun']
export default {
  name: 'DiskList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'disks',
        getParams: {
          details: true,
          'filter.0': 'disk_type.notin(volume)',
        },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
        steadyStatus: {
          status: Object.values(expectStatus.disk).flat(),
          guest_status: Object.values(expectStatus.server).flat(),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'DiskSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'disk_size',
          title: '容量',
          minWidth: 50,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'disk_format',
          title: '格式',
          width: 70,
        },
        {
          field: 'disk_type',
          title: '磁盘类型',
          width: 70,
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? '系统盘' : '数据盘'
          },
        },
        {
          field: 'unused',
          title: '是否挂载',
          width: 70,
          slots: {
            default: ({ row }, h) => {
              return row.guest_count >= 1 ? [<span class="success-color">已挂载</span>] : [<span class="warning-color">待挂载</span>]
            },
          },
        },
        {
          field: 'guest',
          title: '主机',
          minWidth: 100,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              return [
                <div class='text-truncate'>
                  {row.guest}
                  {row.guest_status ? <status status={ row['guest_status'] } statusModule='server'/> : ''}
                </div>,
              ]
            },
          },
        },
        getCopyWithContentTableColumn({ field: 'storage', title: '主存储' }),
        getTimeTableColumn(),
        getBrandTableColumn(),
        getRegionTableColumn(),
        getStatusTableColumn({ statusModule: 'disk' }),
        getProjectTableColumn(),
        {
          field: 'medium_type',
          title: '介质类型',
          width: 70,
          formatter: ({ cellValue }) => {
            return MEDIUM_MAP[cellValue]
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          actions: () => {
            return [
              {
                label: 'IDC',
                permission: 'disks_create',
                action: () => {
                  this.createDialog('CreateDialog', {
                    title: '新建',
                    list: this.list,
                    diskType: 'idc',
                  })
                },
              },
              {
                label: '私有云',
                permission: 'disks_create',
                action: () => {
                  this.createDialog('CreateDialog', {
                    title: '新建',
                    list: this.list,
                    diskType: 'private',
                  })
                },
              },
              {
                label: '公有云',
                permission: 'disks_create',
                action: () => {
                  this.createDialog('CreateDialog', {
                    title: '新建',
                    list: this.list,
                    diskType: 'public',
                  })
                },
              },
            ]
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '删除',
          permission: 'disks_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
              list: this.list,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
      singleActions: [
        {
          label: '扩容',
          permission: 'disks_perform_resize',
          action: obj => {
            this.createDialog('CapacityUpdateDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: obj => {
            const provider = obj.provider.toLowerCase()
            return {
              validate: diskResizeConfig[provider](obj).validate,
              tooltip: diskResizeConfig[provider](obj).tooltip,
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
                  this.createDialog('MountUpdateDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  if (obj.cloud_env === 'onpremise' && obj.storage_type === 'local') {
                    return {
                      validate: false,
                      tooltip: '本地硬盘不允许挂载',
                    }
                  }
                  return {
                    validate: !obj.guest && obj.status === 'ready',
                  }
                },
              },
              {
                label: '卸载',
                permission: 'disks_perform_detachdisk',
                action: () => {
                  this.createDialog('UnMountUpdateDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  if (obj.cloud_env === 'onpremise' && obj.storage_type === 'local') {
                    return {
                      validate: false,
                      tooltip: '本地盘不支持卸载',
                    }
                  }
                  if (obj.disk_type === 'sys') {
                    return {
                      validate: false,
                      tooltip: '本地盘不支持卸载',
                    }
                  }
                  if (obj.portable && obj.portable === false) {
                    return {
                      validate: false,
                      tooltip: '该磁盘类型不允许卸载',
                    }
                  }
                  return {
                    validate: !!obj.guest,
                    tooltip: '请先挂载',
                  }
                },
              },
              {
                label: '新建快照',
                permission: 'disks_perform_create_snapshot',
                action: () => {
                  this.createDialog('CreateSnapshotDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
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
                  this.createDialog('SetSnapshotDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
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
                label: '更改项目',
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => ({
                  validate: obj.guest_count < 1,
                  tooltip: obj.guest ? '已挂载的硬盘不可以更改项目，请卸载后重试' : '',
                }),
              },
              {
                label: '删除',
                permission: 'disks_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '删除',
                    list: this.list,
                  })
                },
                meta: () => this.$getDeleteResult(obj),
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('disk-detail')
    this.list.fetchData()
  },
}
</script>
