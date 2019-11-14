<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import SystemIcon from '@/sections/SystemIcon'
import expectStatus from '@/constants/expectStatus'
import { getBrandTableColumn, getStatusTableColumn, getCopyWithContentTableColumn, getIpsTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ServerRecoveryList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'servers',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.server).flat(),
        filterOptions: {
          name: {
            label: '实例名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          status: {
            label: '实例状态',
            dropdown: true,
            multiple: true,
            items: [
              { label: '运行中', key: 'running' },
              { label: '关机', key: 'ready' },
              { label: '未知', key: 'unknown' },
              { label: '调度失败', key: 'sched_fail' },
            ],
            filter: true,
            formatter: val => {
              return `status.in(${val.join(',')})`
            },
          },
          brand: {
            label: '平台',
            dropdown: true,
            multiple: true,
            items: [
              { label: 'OneCloud', key: 'OneCloud' },
              { label: 'OpenStack', key: 'OpenStack' },
            ],
          },
          os_type: {
            label: '系统类型',
            dropdown: true,
            multiple: true,
            items: [
              { label: 'Windows', key: 'windows' },
              { label: 'Linux', key: 'linux' },
              { label: 'VMware', key: 'VMWare' },
            ],
            filter: true,
            formatter: val => {
              return `os_type.contains(${val})`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({ field: 'name', title: '名称' }),
        getIpsTableColumn({ field: 'ips', title: 'IP' }),
        {
          field: 'instance_type',
          title: '配置',
          slots: {
            default: ({ row }) => {
              let ret = []
              if (row.instance_type) {
                ret.push(<div style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
              }
              const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
              return ret.concat(<div style={{ color: '#53627C' }}>{ config }</div>)
            },
          },
        },
        {
          field: 'os_type',
          title: '系统',
          slots: {
            default: ({ row }) => {
              let name = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type || ''
              if (name.includes('Windows') || name.includes('windows')) {
                name = 'Windows'
              }
              const version = (row.metadata && row.metadata.os_version) ? `${row.metadata.os_version}` : ''
              const tooltip = (version.includes(name) ? version : `${name} ${version}`) || '未知' // 去重
              return [
                <SystemIcon tooltip={ tooltip } name={ name } />,
              ]
            },
          },
        },
        getStatusTableColumn({ statusModule: 'server' }),
        getCopyWithContentTableColumn({ field: 'host', title: '宿主机' }),
        getBrandTableColumn(),
        {
          field: 'auto_delete_at',
          title: '自动清除时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
      ],
      groupActions: [
        {
          label: '清除',
          permission: 'server_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '清除',
              list: this.list,
              requestParams: { override_pending_delete: true },
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
        {
          label: '恢复',
          permission: 'server_perform_cancel_delete',
          action: () => {
            this.createDialog('ServerRestoreDialog', {
              title: '恢复',
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            if (this.list.selectedItems.length > 0 && this.list.selectedItems.find(v => v.status === 'deleting') === undefined) {
              return {
                validate: true,
              }
            }
            return {
              validate: false,
            }
          },
        },
      ],
      singleActions: [
        {
          label: '清除',
          permission: 'server_delete',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '清除',
              list: this.list,
              requestParams: { override_pending_delete: true },
            })
          },
        },
        {
          label: '恢复',
          permission: 'server_perform_cancel_delete',
          action: (obj) => {
            this.createDialog('ServerRestoreDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParams () {
      return {
        details: true,
        with_meta: true,
        pending_delete: true,
      }
    },
  },
}
</script>
