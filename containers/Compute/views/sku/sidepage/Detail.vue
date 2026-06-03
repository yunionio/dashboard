<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="sku"
    :nameProps="{
      edit: false,
    }" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getEnabledTableColumn, getRegionTableColumn } from '@/utils/common/tableColumn'
import { HYPERVISORS_MAP } from '@/constants'
import { chargeTypeColumn } from '../utils'

export default {
  name: 'SkuDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    cloudEnv: {
      type: String,
    },
  },
  data () {
    return {
      baseInfo: [
        getEnabledTableColumn(),
        {
          field: 'cpu_core_count',
          title: this.$t('compute.text_1058'),
        },
        {
          field: 'memory_size_mb',
          title: this.$t('compute.text_1059'),
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024) + 'B'
          },
        },
        {
          field: 'sys_disk_max_size_gb',
          title: this.$t('compute.system_disk_max'),
          formatter: ({ cellValue }) => {
            if (!cellValue) return this.$t('common_216')
            return cellValue + 'GB'
          },
        },
        {
          field: 'total_guest_count',
          title: this.$t('compute.text_699', [this.$t('dictionary.server')]),
          slots: {
            default: ({ row }) => {
              if (row.total_guest_count <= 0) return row.total_guest_count
              return [<a onClick={ () => this.$emit('tab-change', 'vminstance-list') }>{ row.total_guest_count }</a>]
            },
          },
        },
        {
          field: 'brand',
          title: this.$t('compute.text_176'),
        },
      ],
    }
  },
  computed: {
    extraInfo () {
      const extraInfo = [
        {
          title: this.$t('compute.text_497'),
          items: [
            {
              field: 'last_sync',
              title: this.$t('compute.text_1060'),
              formatter: ({ row }) => {
                return this.$moment(row.last_sync).format()
              },
            },
          ],
        },
      ]
      if (this.cloudEnv === 'public') {
        extraInfo[0].items.push(getRegionTableColumn(), chargeTypeColumn())
      }
      if ([HYPERVISORS_MAP.aws.provider, HYPERVISORS_MAP.qcloud.provider, HYPERVISORS_MAP.aliyun.provider].includes(this.data.provider)) {
        extraInfo[0].items.push({
          field: 'cpu_model',
          title: this.$t('compute.cpu_model'),
          formatter: ({ row }) => {
            return row.cpu_model || '-'
          },
        })
        extraInfo[0].items.push({
          field: 'nic_bandwidth',
          title: this.$t('compute.nic_bandwidth'),
          formatter: ({ row }) => {
            return row.nic_bandwidth || '-'
          },
        })
      }
      if (this.data.provider === HYPERVISORS_MAP.aws.provider) {
        extraInfo[0].items.push({
          field: 'disk_performance',
          title: this.$t('compute.disk_performance'),
          formatter: ({ row }) => {
            return row.disk_performance || '-'
          },
        })
      }
      return extraInfo
    },
  },
}
</script>
