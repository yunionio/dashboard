<template>
  <detail
    :on-manager="onManager"
    :data="data"
    resource="eips"
    statusModule="eip"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import { getAssociateNameTableColumn } from '../utils/columns'
import { getBrandTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'EipDetail',
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
    return {
      baseInfo: [
        getBrandTableColumn(),
        getAssociateNameTableColumn(this),
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
      ],
      extraInfo: [],
    }
  },
}
</script>
