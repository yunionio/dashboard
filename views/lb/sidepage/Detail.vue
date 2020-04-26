<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import { LB_SPEC, CHARGE_TYPE } from '@Network/views/lb/constants'
import { getStatusTableColumn, getBrandTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'LbDetail',
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
        getStatusTableColumn({ statusModule: 'lb' }),
        {
          field: 'loadbalance_type',
          title: '类型',
          formatter: ({ row }) => {
            let { provider } = row
            if (provider) {
              provider = provider.toLowerCase()
              const platformList = LB_SPEC[provider]
              if (platformList) {
                const specItem = platformList.find(val => val.key === row.loadbalancer_spec)
                if (specItem) return specItem.label
              }
            }
            return row.loadbalancer_spec || '-'
          },
        },
        {
          field: 'charge_type',
          title: '计费方式',
          formatter: ({ row }) => {
            if (row.charge_type) return CHARGE_TYPE[row.charge_type] || row.charge_type
            return '-'
          },
        },
        getBrandTableColumn(),
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'address',
              title: '服务地址',
              slots: {
                default: ({ row }) => {
                  let text = row.address || '-'
                  let weakTip = ''
                  if (row.eip) {
                    text = row.eip
                    if (row.eip_mode === 'elastic_ip') {
                      weakTip = '（弹性公网IP）'
                    } else if (row.eip_mode === 'public_ip') {
                      weakTip = '（公网ip）'
                    } else {
                      weakTip = ''
                    }
                  } else {
                    weakTip = row.address_type === 'intranet' ? '（私网IP）' : '（公网IP）'
                  }
                  return [<div><span>{ text }</span><span class="text-color-secondary">{ weakTip }</span><copy message={ text } /></div>]
                },
              },
            },
            {
              field: 'vpc',
              title: 'VPC',
            },
            {
              field: 'account',
              title: '云账号',
            },
            {
              field: 'region',
              title: '区域',
            },
          ],
        },
      ],
    }
  },
}
</script>
