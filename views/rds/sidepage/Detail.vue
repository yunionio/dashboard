<template>
  <detail :list="list" :base-info="baseInfo" status-module="rds" :data="data" :extra-info="extraInfo" />
</template>

<script>
// import BrandIcon from '@/sections/BrandIcon'
import { DBINSTANCE_CATEGORY, DBINSTANCE_STORAGE_TYPE } from '../constants'
import { getBrandTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RDSDetail',
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
    const formatPostpaid = (row) => {
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
        ret.push(<div style={{ color: textColor }}>{text}</div>)
      }
      return ret
    }
    return {
      baseInfo: [
        {
          title: '计费方式',
          slots: {
            default: ({ row }) => {
              return formatPostpaid(row)
            },
          },
        },
        {
          field: 'region',
          title: '区域',
        },
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
              field: 'engine',
              title: '数据库引擎',
              slots: {
                default: ({ row }) => {
                  return `${row.engine} ${row.engine_version}`
                },
              },
            },
            {
              field: 'maintain_time',
              title: '可维护时间段',
            },
            {
              field: 'instance_type',
              title: '实例规格',
            },
            {
              field: 'iops',
              title: '最大IOPS',
            },
            {
              field: 'category',
              title: '实例类型',
              slots: {
                default: ({ row }) => {
                  return DBINSTANCE_CATEGORY[row.category] || row.category || '-'
                },
              },
            },
            {
              field: 'storage_type',
              title: '存储类型',
              slots: {
                default: ({ row }) => {
                  return DBINSTANCE_STORAGE_TYPE[row.storage_type] || row.storage_type || '-'
                },
              },
            },
            {
              field: 'vcpu_count',
              title: 'CPU',
              slots: {
                default: ({ row }) => {
                  return `${row.vcpu_count} 核`
                },
              },
            },
            {
              field: 'vmem_size_mb',
              title: '内存',
              slots: {
                default: ({ row }) => {
                  return sizestr(row.vmem_size_mb, 'M', 1024)
                },
              },
            },
          ],
        },
        {
          title: '链接信息',
          items: [
            {
              field: 'internal_connection_str',
              title: '内网地址',
              slots: {
                default: ({ row }) => {
                  if (row.internal_connection_str) {
                    return `${row.internal_connection_str}:${row.port}`
                  }
                  return '-'
                },
              },
            },
            {
              field: 'connection_str',
              title: '外网地址',
              slots: {
                default: ({ row }) => {
                  const addr = row.connection_str
                  const btnTxt = addr ? '关闭外网地址' : '开启外网地址'
                  const isRunning = row.status === 'running'
                  const notRunninTip = !isRunning ? '仅运行中的实例支持此操作' : null
                  let RenderSwitchBtn = null
                  // 华为云不支持开启外网地址和关闭外网地址
                  if (row.provider !== 'Huawei') {
                    if (isRunning) {
                      RenderSwitchBtn = (<a-button type="link" onClick={() => this.handleSwitchPublicAddress(!addr)}>{btnTxt}</a-button>)
                    } else {
                      RenderSwitchBtn = (
                        <a-tooltip placement='top' title={notRunninTip}>
                          <a-button type="link" disabled>{btnTxt}</a-button>
                        </a-tooltip>
                      )
                    }
                  }
                  return (
                    <div>
                      {addr ? `${addr}:${row.port}` : '-'}
                      {RenderSwitchBtn}
                    </div>
                  )
                },
              },
            },
            // {
            //   field: 'port',
            //   title: '数据库端口号',
            // },
            {
              field: 'vpc',
              title: 'VPC',
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
              field: 'secgroup',
              title: '安全组',
              slots: {
                default: ({ row }) => {
                  return (row.provider === 'Huawei' && row.secgroup) ? row.secgroup : '-'
                },
              },
            },
          ],
        },
        {
          title: '存储/备份统计',
          items: [
            {
              field: 'disk_size_gb',
              title: '存储空间',
              slots: {
                default: ({ row }) => {
                  return `共 ${row.disk_size_gb}G`
                },
              },
            },
          ],
        },
      ],
    }
  },
  methods: {
    handleSwitchPublicAddress (bool) {
      const txts = {
        'true': {
          title: '确认开启外网地址？',
        },
        'false': {
          title: '确认关闭外网地址？',
          content: '关闭外网地址后外网IP将无法访问',
        },
      }
      this.createDialog('ConfirmDialog', {
        ...txts[`${bool}`],
        onOk: () => {
          return this.list.onManager('performAction', {
            id: this.data.id,
            steadyStatus: ['runing'],
            managerArgs: {
              action: 'public-connection',
              data: {
                open: bool,
              },
            },
          })
        },
      })
    },
  },
}
</script>
