<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { getNameFilter } from '@/utils/common/tableFilter'
import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  // getStatusTableColumn,
} from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'

const DEVICE_MAP = {
  '10de': 'nvidia',
  '1002': 'amd',
}

export default {
  name: 'GpuList',
  mixins: [WindowsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
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
              return `dev_type.contains("${val}")`
            },
          },
          model: {
            label: '设备型号',
            filter: true,
            formatter: val => {
              return `model.contains("${val}")`
            },
          },
          guest: {
            label: '关联主机',
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `servers.id(guest_id).name.contains("${val}")`
            },
          },
          host: {
            label: '所在宿主机',
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `hosts.id(host_id).name.contains("${val}")`
            },
          },
        },
        steadyStatus: {
          guest_status: [...Object.values(expectStatus.server).flat(), '', undefined],
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '设备型号', key: 'model' },
          { label: '关联主机', key: 'guest' },
          { label: '所在宿主机', key: 'host' },
        ],
      },
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
                  <span class='text-truncate'>{ row.model }</span>
                  <icon class="ml-1" style="line-height: 24px" type={ DEVICE_MAP[device] } />
                </div>,
              ]
            },
          },
        },
        {
          field: 'guest',
          title: '关联主机',
          minWidth: 100,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy={true} row={row} list={this.list} hideField={ true }>
                    <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'GpuSidePage', { tab: 'servers-list' }) }>{ row.guest }</side-page-trigger>
                  </list-body-cell-wrap>
                  {row.guest_status ? <status status={ row['guest_status'] } statusModule='server'/> : ''}
                </div>,
              ]
            },
          },
        },
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
            const validateGuestStatus = item.every(item => item.guest_id && item.guest_status === 'ready')
            const validateGuestId = item.every(item => item.guest_id)
            if (!validateGuestId) {
              return {
                validate: false,
                tooltip: '请选择已关联主机的GPU卡',
              }
            }
            if (!validateGuestStatus) {
              return {
                validate: false,
                tooltip: '关联主机在【关机】的状态下支持该操作',
              }
            }
            return {
              validate: true,
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
            if (!obj.guest_id) {
              return {
                validate: false,
                tooltip: '请选择已关联主机的GPU卡',
              }
            }
            if (obj.guest_status !== 'ready') {
              return {
                validate: false,
                tooltip: '关联主机在【关机】的状态下支持该操作',
              }
            }
            return {
              validate: true,
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
