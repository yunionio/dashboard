<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'ZoneList',
  mixins: [WindowsMixin],
  props: {
    id: String,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'zones',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '物理机', key: 'hosts' },
          { label: '可用物理机', key: 'hosts_enabled' },
          { label: '受管物理机', key: 'baremetals' },
          { label: '可用受管物理机', key: 'baremetals_enabled' },
          { label: '二层网络', key: 'wires' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'ZoneSidePage') }>{ row.name_cn ? `${row.name}(${row.name_cn})` : row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'hosts',
          title: '物理机/可用物理机',
          width: 140,
          formatter: ({ row }) => {
            return `${row.hosts}/${row.hosts_enabled}`
          },
        },
        {
          field: 'baremetals',
          title: '受管物理机/可用受管物理机',
          width: 180,
          formatter: ({ row }) => {
            return `${row.baremetals}/${row.baremetals_enabled}`
          },
        },
        {
          field: 'wires',
          title: '二层网络',
          width: 70,
        },
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('CreateZoneDialog', {
              title: '创建可用区',
              list: this.list,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
      singleActions: [
        {
          label: '删除',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除可用区',
              list: this.list,
            })
          },
          meta: obj => {
            return {
              validate: obj.can_delete,
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('zone-detail')
    this.list.fetchData()
  },
}
</script>
