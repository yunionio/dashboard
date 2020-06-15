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
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'isolated_devices',
        getParams: {
          ...this.getParams,
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
            label: `关联${this.$t('dictionary.server')}`,
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
          { label: `关联${this.$t('dictionary.server')}`, key: 'guest' },
          { label: '所在宿主机', key: 'host' },
        ],
      },
      groupActions: [
        {
          label: `取消关联${this.$t('dictionary.server')}`,
          action: () => {
            this.createDialog('DetachGpuDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: `取消关联${this.$t('dictionary.server')}`,
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
                tooltip: `请选择已关联${this.$t('dictionary.server')}的GPU卡`,
              }
            }
            if (!validateGuestStatus) {
              return {
                validate: false,
                tooltip: `关联${this.$t('dictionary.server')}在【关机】的状态下支持该操作`,
              }
            }
            return {
              validate: true,
            }
          },
        },
        {
          label: '设置预留资源',
          action: () => {
            this.createDialog('SetReserveResourceDialog', {
              onManager: this.onManager,
              data: this.list.selectedItems,
              columns: this.columns,
              refresh: this.refresh,
            })
          },
          meta: () => {
            const item = this.list.selectedItems
            if (item.length <= 0) {
              return {
                validate: false,
                tooltip: '请选择要设置预留资源的GPU卡',
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
