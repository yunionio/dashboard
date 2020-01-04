<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
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
  mixins: [WindowsMixin],
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
            label: '来源',
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
          title: '来源',
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
          formatter: ({ cellValue }) => {
            return cellValue || '-'
          },
        },
      ],
      singleActions: [
        {
          label: '编辑',
          action: obj => {
            this.createDialog('EditRulesDialog', {
              data: [obj],
              title: 'edit',
              columns: this.columns,
              list: this.list,
              type: this.type,
            })
          },
        },
        {
          label: '克隆',
          action: obj => {
            this.createDialog('EditRulesDialog', {
              data: [obj],
              title: 'clone',
              columns: this.columns,
              list: this.list,
              type: this.type,
              secgroup: this.id,
            })
          },
        },
        {
          label: '删除',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除',
              list: this.list,
            })
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('EditRulesDialog', {
              title: 'create',
              data: [{}],
              list: this.list,
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
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
              list: this.list,
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
