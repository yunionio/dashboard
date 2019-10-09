<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'ImageList',
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'servers',
        getParams: this.getParams,
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
        {
          field: 'ip',
          title: 'IP',
          slots: {
            default: ({ row }) => {
              let ret = []
              if (row.eip) {
                ret.push(
                  <copy-with-content message={ row.eip }>{ row.eip }<span class='ml-2 text-weak'>（弹性）</span></copy-with-content>
                )
              }
              if (row.ips) {
                const ips = row.ips.split(',').map(ip => {
                  return <copy-with-content message={ ip }>{ ip }<span class='ml-2 text-weak'>（内网）</span></copy-with-content>
                })
                ret = ret.concat(ips)
              }
              return ret
            },
          },
        },
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
          field: 'secgroups',
          title: '安全组',
          formatter: ({ cellValue }) => {
            return cellValue.map(item => item.name).join(',')
          },
        },
        {
          field: 'billing_type',
          title: '计费方式',
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.billing_type === 'postpaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>按量付费</div>)
              } else if (row.billing_type === 'prepaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>包年包月</div>)
              }
              if (row.expired_at) {
                let dateArr = this.$moment(row.expired_at).fromNow().split(' ')
                let date = dateArr.join('')
                let seconds = this.$moment(row.expired_at).diff(new Date()) / 1000
                let textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
                let text = seconds < 0 ? '已过期' : `${date.substring(0, date.length - 1)}后到期`
                ret.push(<div style={{ color: textColor }}>{ text }</div>)
              }
              return ret
            },
          },
        },
        getStatusTableColumn({ statusModule: 'server' }),
        getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC' }),
        getCopyWithContentTableColumn({ field: 'host', title: '宿主机' }),
        {
          field: 'brand',
          title: '平台',
        },
        getProjectTableColumn(),
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createServer()
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
          label: '更多',
          actions: (obj) => {
            return [
              {
                label: '实例状态',
                submenus: [
                  {
                    label: '开机',
                    action: () => {
                      this.manager.performAction({
                        action: 'start',
                        id: obj.id,
                      })
                      this.$refs['list'].fetchData()
                    },
                    meta: () => {
                      return {
                        validate: obj.status !== 'running',
                      }
                    },
                  },
                  {
                    label: '关机',
                    action: () => {
                      this.manager.performAction({
                        action: 'stop',
                        id: obj.id,
                      })
                      this.$refs['list'].fetchData()
                    },
                    meta: () => {
                      return {
                        validate: obj.status !== 'ready',
                      }
                    },
                  },
                  {
                    label: '重启',
                    action: () => {
                      this.manager.performAction({
                        action: 'restart',
                        id: obj.id,
                      })
                      this.$refs['list'].fetchData()
                    },
                  },
                ],
              },
              {
                label: '删除',
                submenus: [
                  {
                    label: '删除',
                    action: () => {
                      this.manager.delete({
                        id: obj.id,
                      })
                      this.$refs['list'].fetchData()
                    },
                    meta: () => {
                      return {
                        validate: obj.can_delete,
                      }
                    },
                  },
                ],
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    createServer () {
      this.$router.push('/baremetal/create')
    },
    getParams () {
      return {
        hypervisor: 'baremetal',
      }
    },
  },
}
</script>
