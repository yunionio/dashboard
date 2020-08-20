<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="networks"
    status-module="network" />
</template>

<script>
import {
  getBrandTableColumn,
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'NetworkDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getBrandTableColumn(),
        getPublicScopeTableColumn({ vm: this, resource: 'natgateways' }),
        {
          field: 'guest_ip_start',
          title: 'IP范围',
          formatter: ({ cellValue, row }) => {
            return `${cellValue}-${row.guest_ip_end}`
          },
        },
        {
          field: 'guest_ip_mask',
          title: '子网掩码',
        },
        {
          field: 'guest_gateway',
          title: '网关',
        },
        {
          field: 'ports',
          title: '使用情况',
          slots: {
            default: ({ row }) => {
              return [
                <div>
                  总量{row.ports}，已用{row.ports_used <= 0 ? 0 : <a onClick={ () => this.$emit('tab-change', 'i-p-list') }>{row.ports_used}</a> }（含预留IP {row.reserve_vnics}）
                </div>,
              ]
            },
          },
        },
        {
          field: 'schedtags',
          title: '调度标签',
          formatter: ({ cellValue, row }) => {
            if (row.schedtags && row.schedtags.length > 0) {
              const schedtags = row.schedtags.map(v => v.name)
              return schedtags.join('，')
            }
            return '-'
          },
        },
      ],
      extraInfo: [
        {
          title: '配置信息',
          items: [
            getCopyWithContentTableColumn({
              field: 'vpc',
              title: 'VPC',
              hideField: true,
              slotCallback: row => {
                if (!row.vpc) return '-'
                return [
                  <side-page-trigger permission='vpcs_get' name='VpcSidePage' id={row.vpc_id} vm={this}>{ row.vpc }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'guest_dns',
              title: '域名服务器',
            },
            {
              field: 'guest_domain',
              title: '主机域名后缀',
              formatter: ({ cellValue }) => {
                return cellValue || '-'
              },
            },
            {
              field: 'wire',
              title: '二层网络',
              slots: {
                default: ({ row }) => {
                  return [
                    <side-page-trigger permission='wires_get' name='WireSidePage' id={row.wire_id} vm={this}>{ row.wire }</side-page-trigger>,
                  ]
                },
              },
            },
            {
              field: 'server_type',
              title: 'IP类型',
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
                return '未知'
              },
            },
            {
              field: 'vlan_id',
              title: 'VLAN ID',
              formatter: ({ cellValue }) => {
                return cellValue || '-'
              },
            },
          ],
        },
      ],
    }
  },
}
</script>
