<template>
  <detail
    :on-manager="onManager"
    :base-info="baseInfo"
    status-module="rds"
    :data="data"
    resource="dbinstances"
    :extra-info="extraInfo" />
</template>

<script>
// import BrandIcon from '@/sections/BrandIcon'
import { DBINSTANCE_CATEGORY, DBINSTANCE_STORAGE_TYPE } from '../constants'
import {
  getBrandTableColumn,
  getSwitchTableColumn,
} from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'RDSDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
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
        ret.push(<div style={{ color: '#0A1F44' }}>{ this.$t('billingType.postpaid') }</div>)
      } else if (row.billing_type === 'prepaid') {
        ret.push(<div style={{ color: '#0A1F44' }}>{ this.$t('billingType.prepaid') }</div>)
      }
      if (row.expired_at) {
        const dateArr = this.$moment(row.expired_at).fromNow().split(' ')
        const date = dateArr.join('')
        const seconds = this.$moment(row.expired_at).diff(new Date()) / 1000
        const textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
        const text = seconds < 0 ? this.$t('db.text_162') : this.$t('db.text_163', [date.substring(0, date.length - 1)])
        ret.push(<div style={{ color: textColor }}>{text}</div>)
      }
      return ret
    }
    return {
      baseInfo: [
        getBrandTableColumn(),
        {
          title: this.$t('db.text_54'),
          slots: {
            default: ({ row }) => {
              return formatPostpaid(row)
            },
          },
        },
        {
          field: 'region',
          title: this.$t('db.text_40'),
          slots: {
            default: ({ row }) => {
              if (!row.region_id) return row.region || '-'
              const p = hasPermission({ key: 'cloudregions_get' })
              let node
              if (p) {
                node = (
                  <list-body-cell-wrap copy row={ row } onManager={ this.onManager } field='region' title={ row.region } hideField={ true }>
                    <side-page-trigger permission='areas_get' name='CloudregionSidePage' id={row.region_id} vm={this}>{ row.region }</side-page-trigger>
                  </list-body-cell-wrap>
                )
              } else {
                node = (
                  <list-body-cell-wrap copy row={ row } onManager={ this.onManager } field='region' title={ row.region } />
                )
              }
              return [
                <div class='text-truncate'>{ node }</div>,
              ]
            },
          },
        },
        {
          field: 'zone',
          title: this.$t('db.text_133'),
          slots: {
            default: ({ row }) => {
              const ret = []
              let i = 0
              for (;;) {
                ++i
                const value = row[`zone${i}_name`]
                if (!value) break
                ret.push(
                  <div>
                    {value}({i > 1 ? this.$t('db.text_164') : this.$t('db.text_165')})
                  </div>,
                )
              }
              return ret
            },
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('db.text_166'),
          items: [
            {
              field: 'engine',
              title: this.$t('db.text_57'),
              slots: {
                default: ({ row }) => {
                  return `${row.engine} ${row.engine_version}`
                },
              },
            },
            {
              field: 'maintain_time',
              title: this.$t('db.text_167'),
            },
            {
              field: 'instance_type',
              title: this.$t('db.text_168'),
            },
            {
              field: 'iops',
              title: this.$t('db.text_169'),
            },
            {
              field: 'category',
              title: this.$t('db.text_119'),
              slots: {
                default: ({ row }) => {
                  return DBINSTANCE_CATEGORY[row.category] || row.category || '-'
                },
              },
            },
            {
              field: 'storage_type',
              title: this.$t('db.text_120'),
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
                  return this.$t('db.text_170', [row.vcpu_count])
                },
              },
            },
            {
              field: 'vmem_size_mb',
              title: this.$t('db.text_132'),
              slots: {
                default: ({ row }) => {
                  return sizestr(row.vmem_size_mb, 'M', 1024)
                },
              },
            },
          ],
        },
        {
          title: this.$t('db.text_171'),
          items: [
            {
              field: 'internal_connection_str',
              title: this.$t('db.text_172'),
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
              title: this.$t('db.text_173'),
              slots: {
                default: ({ row }) => {
                  const addr = row.connection_str
                  const btnTxt = addr ? this.$t('db.text_174') : this.$t('db.text_175')
                  const isRunning = row.status === 'running'
                  const notRunninTip = !isRunning ? this.$t('db.text_156') : null
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
              title: this.$t('db.text_176'),
              slots: {
                default: ({ row }) => {
                  return row.network || '-'
                },
              },
            },
            {
              field: 'secgroup',
              title: this.$t('db.text_144'),
              slots: {
                default: ({ row }) => {
                  return row.secgroup || '-'
                },
              },
            },
          ],
        },
        {
          title: this.$t('db.text_177'),
          items: [
            {
              field: 'disk_size_gb',
              title: this.$t('db.text_116'),
              slots: {
                default: ({ row }) => {
                  return this.$t('db.text_178', [row.disk_size_gb])
                },
              },
            },
          ],
        },
        {
          title: this.$t('db.text_179'),
          items: [
            getSwitchTableColumn({
              field: 'disable_delete',
              title: this.$t('db.text_145'),
              change: val => {
                this.onManager('update', {
                  id: this.data.id,
                  managerArgs: {
                    data: { disable_delete: val },
                  },
                })
              },
            }),
          ],
        },
      ],
    }
  },
  methods: {
    handleSwitchPublicAddress (bool) {
      const txts = {
        true: {
          title: this.$t('db.text_180'),
        },
        false: {
          title: this.$t('db.text_181'),
          content: this.$t('db.text_182'),
        },
      }
      this.createDialog('ConfirmDialog', {
        ...txts[`${bool}`],
        onOk: () => {
          return this.onManager('performAction', {
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
