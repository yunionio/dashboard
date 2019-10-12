<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ZoneList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'zones',
        getParams: { details: true, with_meta: true, cloud_env: 'private_or_onpremise' },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
      columns: [
        {
          field: 'name',
          title: '名称',
          width: 300,
          slots: {
            default: ({ row }, h) => {
              return [
                <list-body-cell-wrap ignore-field copy edit row={row} list={this.list}>
                  { row.name_cn ? `${row.name}(${row.name_cn})` : row.name }
                </list-body-cell-wrap>,
                <list-body-cell-wrap edit field="description" row={row} list={this.list} />,
              ]
            },
          },
        },
        {
          field: 'hosts',
          title: '物理机/可用物理机',
          formatter: ({ row }) => {
            return `${row.hosts}/${row.hosts_enabled}`
          },
        },
        {
          field: 'baremetals',
          title: '受管物理机/可用受管物理机',
          formatter: ({ row }) => {
            return `${row.baremetals}/${row.baremetals_enabled}`
          },
        },
        {
          field: 'wires',
          title: '二层网络',
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
    this.list.fetchData()
  },
}
</script>
