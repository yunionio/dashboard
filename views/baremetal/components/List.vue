<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getCopyWithContentTableColumn, getIpsTableColumn, getNameDescriptionTableColumn, getBrandTableColumn } from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getStatusFilter,
  getTenantFilter,
  getIpFilter,
} from '@/utils/common/tableFilter'

export default {
  name: 'ImageList',
  props: {
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'servers',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          ips: getIpFilter(),
          status: getStatusFilter('status.server'),
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
          tenant: getTenantFilter(),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({ addLock: true, vm: this }),
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        {
          field: 'instance_type',
          title: '配置',
          showOverflow: 'ellipsis',
          minWidth: 120,
          sortable: true,
          slots: {
            default: ({ row }) => {
              let ret = []
              if (row.instance_type) {
                ret.push(<div class='text-truncate' style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
              }
              const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
              return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
            },
          },
        },
        {
          field: 'secgroups',
          title: '安全组',
          width: 80,
          showOverflow: 'ellipsis',
          formatter: ({ cellValue }) => {
            return cellValue.map(item => item.name).join(',')
          },
        },
        {
          field: 'billing_type',
          title: '计费方式',
          width: 70,
          showOverflow: 'ellipsis',
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
        getCopyWithContentTableColumn({ field: 'host', title: '宿主机', sortable: true }),
        getBrandTableColumn(),
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
    getParam () {
      return {
        hypervisor: 'baremetal',
        ...this.getParams,
      }
    },
  },
}
</script>
