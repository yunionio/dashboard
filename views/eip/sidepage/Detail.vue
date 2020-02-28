<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import { getStatusTableColumn, getBrandTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'

export default {
  name: 'EipDetail',
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
    return {
      baseInfo: [
        {
          field: 'name',
          title: '名称',
        },
        getStatusTableColumn({ statusModule: 'eip' }),
        {
          field: 'ip_addr',
          title: 'IP地址',
        },
        {
          field: 'bandwidth',
          title: '带宽',
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'charge_type',
          title: '计费方式',
          formatter: ({ cellValue }) => {
            const type = {
              traffic: '按流量计费',
              bandwidth: '按带宽计费',
            }
            return type[cellValue]
          },
        },
        {
          field: 'tenant',
          title: `所属${this.$t('dictionary.project')}`,
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'account',
              title: '云账号',
              // formatter: ({ row }) => {
              //   return this.$moment(row.last_sync).format()
              // },
            },
            {
              field: 'region',
              title: '区域',
            },
            {
              field: 'region_ext_id',
              title: '可用区',
            },
            getBrandTableColumn(),
          ],
        },
      ],
    }
  },
}
</script>
