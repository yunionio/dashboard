<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { getNameFilter } from '@/utils/common/tableFilter'
import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

const DEVICE_MAP = {
  '10de': 'nvidia',
  '1002': 'amd',
}

export default {
  name: 'GpuList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'isolated_devices',
        getParams: {
          details: true,
        },
        filterOptions: {
          name: getNameFilter(),
          dev_type: {
            label: '设备类型',
            filter: true,
            formatter: val => {
              return `dev_type.contains(${val})`
            },
          },
          model: {
            label: '设备型号',
            filter: true,
            formatter: val => {
              return `model.contains(${val})`
            },
          },
          guest: {
            label: '关联主机',
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `servers.id(guest_id).name.contains(${val})`
            },
          },
          host: {
            label: '所在宿主机',
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `hosts.id(host_id).name.contains(${val})`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'GpuSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'dev_type',
          title: '设备类型',
          width: 120,
        },
        {
          field: 'model',
          title: '设备型号',
          minWidth: 120,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              const device = row.vendor_device_id.split(':')[0]
              if (!device) {
                return row.model
              }
              return [
                <div class='d-flex'>
                  <span class='text-truncate'>{ row.model }</span>,
                  <icon type={ DEVICE_MAP[device] } />
                </div>,
              ]
            },
          },
        },
        getCopyWithContentTableColumn({
          field: 'guest',
          title: '关联主机',
          hideField: true,
          slotCallback: row => row.guest || row.guest_id,
        }),
        getCopyWithContentTableColumn({
          field: 'host',
          title: '所在宿主机',
          hideField: true,
          slotCallback: row => row.host || row.host_id,
        }),
      ],
      groupActions: [
        {
          label: '取消关联主机',
          action: () => {
            this.createDialog('DetachGpuDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '取消关联主机',
              list: this.list,
            })
          },
          meta: () => {
            const item = this.list.selectedItems
            if (item.length <= 0) {
              return {
                validate: false,
                tooltip: '请先选择要解绑的GPU卡',
              }
            }
            return {
              validate: item.every(item => item.guest_id),
              tooltip: '请选择已绑定的GPU卡',
            }
          },
        },
      ],
      singleActions: [
        {
          label: '关联主机',
          action: obj => {
            this.createDialog('AttachGpuDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: obj => {
            return {
              validate: !obj.guest_id,
            }
          },
        },
        {
          label: '取消关联主机',
          action: obj => {
            this.createDialog('DetachGpuDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: obj => {
            return {
              validate: !!obj.guest_id,
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('gpu-detail')
    this.list.fetchData()
  },
}
</script>
