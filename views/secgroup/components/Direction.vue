<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'

const PROTOCOL = {
  any: 'ANY',
  tcp: 'TCP',
  udp: 'UDP',
  icmp: 'ICMP',
}

const ACTIONS = {
  allow: '允许',
  deny: '拒绝',
}

export default {
  name: 'DirectionList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    type: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  data () {
    const title = this.type === 'out' ? '目标' : '来源'
    return {
      list: this.$list.createList(this, {
        resource: 'secgrouprules',
        getParams: {
          direction: this.type,
          order: 'desc',
          order_by: 'priority',
          secgroup: this.id,
        },
        filterOptions: {
          cidr: {
            label: title,
            filter: true,
            formatter: val => {
              return `cidr.contains("${val}")`
            },
          },
          ports: {
            label: '端口',
            filter: true,
            formatter: val => {
              // if ((val && val.toLowerCase(val)) === 'all') {
              //   return 'ports.isnullorempty()'
              // }
              return `ports.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        {
          field: 'cidr',
          title: title,
          minWidth: 70,
          showOverflow: 'ellipsis',
        },
        {
          field: 'protocol',
          title: '协议',
          formatter: ({ cellValue, row }) => {
            return PROTOCOL[cellValue] || row.protocol
          },
        },
        {
          field: 'ports',
          title: '端口',
          formatter: ({ cellValue, row }) => {
            return cellValue === 'any' ? 'ALL' : !row.ports ? 'ALL' : row.ports
          },
        },
        {
          field: 'action',
          title: '策略',
          formatter: ({ cellValue, row }) => {
            return ACTIONS[cellValue] || row.action
          },
        },
        {
          field: 'priority',
          title: '优先级',
        },
        {
          field: 'description',
          title: '备注',
          slots: {
            default: ({ row }, h) => {
              const ret = []
              ret.push(h('list-body-cell-wrap', {
                props: {
                  edit: true,
                  copy: true,
                  field: 'description',
                  row,
                  onManager: this.onManager,
                  formRules: [],
                },
              }))
              return ret
            },
          },
        },
      ],
      singleActions: [
        {
          label: '编辑',
          permission: 'secgrouprules_update',
          action: obj => {
            this.createDialog('EditRulesDialog', {
              data: [obj],
              title: 'edit',
              columns: this.columns,
              onManager: this.onManager,
              refresh: this.refresh,
              type: this.type,
            })
          },
        },
        {
          label: '克隆',
          permission: 'secgrouprules_create',
          action: obj => {
            this.createDialog('EditRulesDialog', {
              data: [obj],
              title: 'clone',
              columns: this.columns,
              onManager: this.onManager,
              refresh: this.refresh,
              type: this.type,
              secgroup: this.id,
            })
          },
        },
        {
          label: '删除',
          permission: 'secgrouprules_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: '删除',
              name: '规则',
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'secgrouprules_create',
          action: () => {
            this.createDialog('EditRulesDialog', {
              title: 'create',
              data: [{}],
              onManager: this.onManager,
              refresh: this.refresh,
              type: this.type,
              secgroup: this.id,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '删除',
          permission: 'secgrouprules_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
              onManager: this.onManager,
            })
          },
          meta: (obj) => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
