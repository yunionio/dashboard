<template>
  <detail
    :on-manager="onManager"
    :data="data"
    statusModule="lb"
    resource="lbs"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import { LB_SPEC, CHARGE_TYPE } from '@Network/views/lb/constants'
import { getBrandTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LbDetail',
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
        {
          field: 'loadbalance_type',
          title: this.$t('network.text_249'),
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
          field: 'cluster',
          title: this.$t('network.text_19'),
          formatter: ({ row }) => {
            return row.cluster || '-'
          },
        },
        getBrandTableColumn(),
        {
          field: 'charge_type',
          title: this.$t('network.text_192'),
          formatter: ({ row }) => {
            if (row.charge_type) return CHARGE_TYPE[row.charge_type] || row.charge_type
            return '-'
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('network.text_308'),
          items: [
            {
              field: 'address',
              title: this.$t('network.text_248'),
              slots: {
                default: ({ row }) => {
                  let text = row.address || '-'
                  let weakTip = ''
                  if (row.eip) {
                    text = row.eip
                    if (row.eip_mode === 'elastic_ip') {
                      weakTip = this.$t('network.text_304')
                    } else if (row.eip_mode === 'public_ip') {
                      weakTip = this.$t('network.text_305')
                    } else {
                      weakTip = ''
                    }
                  } else {
                    weakTip = row.address_type === 'intranet' ? this.$t('network.text_306') : this.$t('network.text_307')
                  }
                  return [<div><span>{ text }</span><span class="text-color-secondary">{ weakTip }</span><copy message={ text } /></div>]
                },
              },
            },
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
              hidden: this.$store.getters.isProjectMode,
            }),
          ],
        },
      ],
    }
  },
}
</script>
