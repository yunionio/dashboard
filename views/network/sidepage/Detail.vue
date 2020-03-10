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
import { getBrandTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'NetworkDetail',
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
          formatter: ({ cellValue, row }) => {
            return `总量${cellValue}，已用${row.ports_used}（含预留IP ${row.reserve_vnics}）`
          },
        },
      ],
      extraInfo: [
        {
          title: '配置信息',
          items: [
            getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC' }),
            {
              field: 'dns',
              title: '域名服务器',
            },
            {
              field: 'domain',
              title: '主机域名后缀',
              formatter: ({ cellValue }) => {
                return cellValue || '-'
              },
            },
            {
              field: 'wire',
              title: '二层网络',
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
