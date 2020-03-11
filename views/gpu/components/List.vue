<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'GpuList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
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
      groupActions: [
        {
          label: '取消关联主机',
          action: () => {
            this.createDialog('DetachGpuDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '取消关联主机',
              refresh: this.refresh,
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
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row, tab) {
      this.initSidePageTab(tab)
      this.sidePageTriggerHandle(this, 'GpuSidePage', {
        id: row.id,
        resource: 'isolated_devices',
        currentTab: 'servers-list',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
