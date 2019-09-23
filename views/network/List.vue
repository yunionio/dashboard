<template>
  <div>
    <page-header title="IP子网" />
    <page-body>
      <page-list
        :list="list"
        :columns="columns"
        :group-actions="groupActions" />
    </page-body>
  </div>
</template>

<script>
import {
  getProjectTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'NetworkList',
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'networks',
        filterOptions: {
          name: {
            label: '实例名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          ip: {
            label: 'IP',
            filter: true,
            formatter: val => {
              return `ip.contains(${val})`
            },
          },
          server_type: {
            label: '类型',
            dropdown: true,
            items: [
              { label: '物理机', key: 'baremetal' },
              { label: '容器', key: 'container' },
              { label: '虚拟机', key: 'guest' },
              { label: 'PXE', key: 'pxe' },
              { label: 'IPMI', key: 'ipmi' },
            ],
          },
          status: {
            label: '状态',
            dropdown: true,
            items: [
              { label: '初始化', key: 'init' },
              { label: '正在创建', key: 'pending' },
              { label: '正常', key: 'available' },
              { label: '异常', key: 'failed' },
              { label: '开始删除', key: 'start_delete' },
              { label: '正在删除', key: 'deleting' },
              { label: '已删除', key: 'deleted' },
              { label: '删除失败', key: 'delete_failed' },
              { label: '未知', key: 'unknown' },
            ],
            filter: true,
            formatter: val => {
              return `status.in(${val})`
            },
          },
        },
      }),
      columns: [
        { field: 'name', title: '名称' },
        {
          field: 'ip',
          title: 'IP地址',
          slots: {
            default: ({ row }) => {
              return [
                <div>起：{ row.guest_ip_start }</div>,
                <div>止：{ row.guest_ip_end }</div>,
              ]
            },
          },
        },
        {
          field: 'type',
          title: '类型',
          formatter: ({ cellValue }) => {
            if (cellValue === 'baremetal') {
              return '物理机'
            }
            if (cellValue === 'container') {
              return '容器'
            }
            if (cellValue === 'guest') {
              return '虚拟机'
            }
            if (cellValue === 'pxe') {
              return 'PXE'
            }
            if (cellValue === 'ipmi') {
              return 'IPMI'
            }
            return '未知'
          },
        },
        getStatusTableColumn({ statusModule: 'network' }),
        {
          field: 'ports',
          title: '使用情况',
          formatter: ({ row }) => {
            return '总计：' + row.ports + ' 使用：' + row.ports_used
          },
        },
        getBrandTableColumn(),
        getProjectTableColumn(),
        getRegionTableColumn(),
        {
          field: 'wire',
          title: '二层网络',
        },
        {
          field: 'vlan_id',
          title: 'VLAN',
        },
        {
          field: 'vpc',
          title: 'VPC',
        },
        {
          field: 'account',
          title: '云账号',
        },
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.$router.push({ name: 'NetworkCreate' })
          },
          meta: () => {
            return {
              buttonType: 'primary',
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
