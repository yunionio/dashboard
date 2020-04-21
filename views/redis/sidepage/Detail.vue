<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="redis" />
</template>

<script>
// import BrandIcon from '@/sections/BrandIcon'
import { NODE_TYPE, PERFORMANCE_TYPE } from '@DB/views/redis/constants'
import { getBrandTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'redisDetail',
  mixins: [WindowsMixin],
  props: {
    list: {
      type: Object,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'account',
          title: '云账号',
        },
        {
          field: 'manager',
          title: '云订阅',
        },
        getBrandTableColumn(),
      ],
      extraInfo: [
        {
          title: '数据库信息',
          items: [
            {
              title: '类型版本',
              slots: {
                default: ({ row }) => {
                  return `${row.engine || ''} ${row.engine_version || ''}`
                },
              },
            },
            {
              title: '节点类型',
              slots: {
                default: ({ row }) => {
                  return NODE_TYPE[row.node_type]
                },
              },
            },
            {
              title: '性能类型',
              slots: {
                default: ({ row }) => {
                  return PERFORMANCE_TYPE[row.performance_type] || '-'
                },
              },
            },
            {
              title: '可维护时间段',
              slots: {
                default: ({ row }) => {
                  if (row.maintain_start_time && row.maintain_end_time) {
                    return `${row.maintain_start_time}${row.maintain_end_time ? ' ~ ' + row.maintain_end_time : ''}`
                  }
                  return '-'
                },
              },
            },
            {
              field: 'instance_type',
              title: '实例规格',
            },
            {
              field: 'cpu_arch',
              title: 'CPU',
              slots: {
                default: ({ row }) => {
                  return row.cpu_arch || '-'
                },
              },
            },
            {
              field: 'arch_type',
              title: '储存架构',
            },
            {
              field: 'capacity_mb',
              title: '内存',
              slots: {
                default: ({ row }) => {
                  return sizestr(row.capacity_mb, 'M', 1024)
                },
              },
            },
          ],
        },
        {
          title: '链接信息',
          items: [
            {
              field: 'private_ip_addr',
              title: '内网地址',
              slots: {
                default: ({ row }) => {
                  const pri = row.private_dns || row.private_ip_addr
                  if (pri) {
                    return `${pri}:${row['private_connect_port']}`
                  }
                  return '-'
                },
              },
            },
            {
              field: 'public_ip_addr',
              title: '外网地址',
              slots: {
                default: ({ row }) => {
                  const pub = row.public_dns || row.public_ip_addr
                  const port = row['public_connect_port']
                  const btnTxt = port ? '关闭外网地址' : '开启外网地址'
                  const isRunning = row.status === 'running'
                  const notRunninTip = !isRunning ? '仅运行中的实例支持此操作' : null
                  let RenderSwitchBtn = null
                  if (isRunning) {
                    RenderSwitchBtn = (<a-button type="link" onClick={() => this.handleSwitchPublicAddress(!port)}>{btnTxt}</a-button>)
                  } else {
                    RenderSwitchBtn = (
                      <a-tooltip placement='top' title={notRunninTip}>
                        <a-button type="link" disabled>{btnTxt}</a-button>
                      </a-tooltip>
                    )
                  }
                  if (row.provider === 'Huawei') {
                    return '-'
                  }
                  return (
                    <div>
                      {pub ? `${pub}:${port}` : '-' }
                      {RenderSwitchBtn}
                    </div>
                  )
                },
              },
            },
            {
              field: 'vpc',
              title: 'VPC',
              slots: {
                default: ({ row }) => {
                  return row.vpc || '-'
                },
              },
            },
            {
              field: 'network',
              title: '子网',
              slots: {
                default: ({ row }) => {
                  return row.network || '-'
                },
              },
            },
            {
              field: 'auth_mode',
              title: '访问方式',
              slots: {
                default: ({ row }) => {
                  return row['auth_mode'] === 'on' ? '密码访问' : '免密访问'
                },
              },
            },
          ],
        },
        // {
        //   title: '其他信息',
        //   items: [
        //     {
        //       field: 'created_at',
        //       title: '创建时间',
        //       slots: {
        //         default: ({ row }) => {
        //           return this.$moment(row.created_at).format()
        //         },
        //       },
        //     },
        //     {
        //       field: 'updated_at',
        //       title: '更新时间',
        //       slots: {
        //         default: ({ row }) => {
        //           return this.$moment(row.updated_at).format()
        //         },
        //       },
        //     },
        //     {
        //       title: '删除保护',
        //       slots: {
        //         default: (row, h) => {
        //           const handleChange = ({ target }) => {
        //             console.log(target.value)
        //           }
        //           return (
        //             <a-radio-group onChange={handleChange}>
        //               <a-radio-button value={true}>开启</a-radio-button>
        //               <a-radio-button value={false}>关闭</a-radio-button>
        //             </a-radio-group>
        //           )
        //         },
        //       },
        //     },
        //   ],
        // },
      ],
    }
  },
  methods: {
    async fetchSwitchPublic (bool) {
      if (bool) {
        return this.list.onManager('performAction', {
          steadyStatus: 'running',
          id: this.data.id,
          managerArgs: {
            action: 'allocate-public-connection',
          },
        })
      } else {
        return this.list.onManager('performAction', {
          steadyStatus: 'running',
          id: this.data.id,
          managerArgs: {
            action: 'release-public-connection',
          },
        })
      }
    },
    handleSwitchPublicAddress (bool) {
      const txts = {
        'true': {
          title: '确认开启外网地址？',
          content: '开启外网地址后将外网IP设置白名单即可访问',
        },
        'false': {
          title: '确认关闭外网地址？',
          content: '关闭外网地址后外网IP将无法访问',
        },
      }
      this.createDialog('ConfirmDialog', {
        ...txts[`${bool}`],
        onOk: () => {
          return this.fetchSwitchPublic(bool)
        },
      })
    },
  },
}
</script>
