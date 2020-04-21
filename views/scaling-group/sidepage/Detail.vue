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
          title: '伸缩策略',
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
          title: '伸缩组信息',
          items: [
            {
              field: 'guest_template',
              title: '主机模板',
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
              title: '当前实例数',
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
              title: '期望实例数',
              formatter: ({ row }) => {
                return row['desire_instance_number']
              },
            },
            {
              field: 'min_instance_number',
              title: '最小实例数',
            },
            {
              field: 'max_instance_number',
              title: '最大实例数',
            },
            {
              field: 'shrink_principle',
              title: '移除策略',
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
            }),
            {
              field: 'loadbalancer',
              title: '负载均衡',
            },
            {
              field: 'health_check_mode',
              title: '健康检查方式',
              formatter: ({ row }) => {
                return this.$t('flexGroupHealthCheckMode')[row.health_check_mode]
              },
            },
            {
              field: 'health_check_cycle',
              title: '检查周期',
              formatter: ({ row }) => {
                return this.$t('flexGroupCycles')[row.health_check_cycle]
              },
            },
            {
              field: 'health_check_gov',
              title: '健康状态检查宽限期',
              formatter: ({ row }) => {
                return `${row['health_check_gov']}s`
              },
            },
          ],
        },
      ],
    }
  },
}
</script>
