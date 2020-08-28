<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="scalinggroup" />
</template>

<script>
// import { sizestr } from '@/utils/utils'
import { getBrandTableColumn, getEnabledTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ScalingGroupDetailSidpage',
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
        getEnabledTableColumn(),
        getBrandTableColumn(),
        {
          field: 'scaling_policy_number',
          title: this.$t('compute.text_949'),
          slots: {
            default: ({ row }) => {
              return [
                <a onClick={ () => this.$emit('tab-change', 'rule-list') }>{row.scaling_policy_number}</a>,
              ]
            },
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('compute.text_959'),
          items: [
            {
              field: 'guest_template',
              title: this.$t('compute.text_94'),
              slots: {
                default: ({ row }) => {
                  return [
                    <a onClick={ () => this.$emit('tab-change', 'server-template-list') }>{row.guest_template}</a>,
                  ]
                },
              },
            },
            {
              field: 'instance_number',
              title: this.$t('compute.text_874'),
              slots: {
                default: ({ row }) => {
                  return [
                    <a onClick={ () => this.$emit('tab-change', 'server-list') }>{row.instance_number}</a>,
                  ]
                },
              },
            },
            {
              field: 'desire_instance_number',
              title: this.$t('compute.text_875'),
              formatter: ({ row }) => {
                return row.desire_instance_number
              },
            },
            {
              field: 'min_instance_number',
              title: this.$t('compute.text_876'),
            },
            {
              field: 'max_instance_number',
              title: this.$t('compute.text_877'),
            },
            {
              field: 'shrink_principle',
              title: this.$t('compute.text_960'),
              formatter: ({ row }) => {
                return this.$t('flexGrouPprinciple')[row.shrink_principle]
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
              hidden: () => this.$store.getters.isProjectMode,
            }),
            getCopyWithContentTableColumn({
              field: 'network',
              title: 'IP子网',
              hideField: true,
              slotCallback: row => {
                if (!row.networks || !row.networks.length) return '-'
                const [{ id, name }] = row.networks
                return [
                  <side-page-trigger permission='networks_get' name='NetworkSidePage' id={id} vm={this}>{ name }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'loadbalancer',
              title: this.$t('compute.text_899'),
            },
            {
              field: 'health_check_mode',
              title: this.$t('compute.text_903'),
              formatter: ({ row }) => {
                return this.$t('flexGroupHealthCheckMode')[row.health_check_mode]
              },
            },
            {
              field: 'health_check_cycle',
              title: this.$t('compute.text_904'),
              formatter: ({ row }) => {
                return this.$t('flexGroupCycles')[row.health_check_cycle]
              },
            },
            {
              field: 'health_check_gov',
              title: this.$t('compute.text_905'),
              formatter: ({ row }) => {
                return `${row.health_check_gov}s`
              },
            },
          ],
        },
      ],
    }
  },
}
</script>
