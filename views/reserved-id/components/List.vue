<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import { getCopyWithContentTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: '',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'reservedips',
        getParams: { details: true, with_meta: true },
        filterOptions: {
          name: {
            label: 'IP子网',
            filter: true,
            formatter: val => {
              return `networks.id(network_id).name.contains(${val})`
            },
            jointFilter: true,
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'network',
          title: 'IP子网',
        }),
        getCopyWithContentTableColumn({
          field: 'ip_addr',
          title: 'IP地址',
        }),
        {
          field: 'notes',
          title: '备注',
          slots: {
            default: ({ row }, h) => {
              return [<list-body-cell-wrap edit field="notes" row={row} list={this.list} />]
            },
          },
        },
        getTimeTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('ReservedIpCreateDialog', {
              title: '新建',
              list: this.list,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '释放',
          permission: 'reservedips_delete',
          action: () => {
            this.createDialog('freedDialog', {
              title: '释放',
              list: this.list,
              columns: this.columns,
              data: this.list.selectedItems,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '释放',
          action: (obj) => {
            this.createDialog('freedDialog', {
              title: '释放',
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: (obj) => {
            return this.$getDeleteResult(obj)
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
}
</script>
