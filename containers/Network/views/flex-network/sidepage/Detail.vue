<template>
  <detail
    resource="networkinterfaces"
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    status-module="network"
    :extra-info="extraInfo" />
</template>

<script>
import { getBrandTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'FlexNetworkDetail',
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
          field: 'mac',
          title: this.$t('network.text_228'),
        },
        {
          field: 'associate_type',
          title: this.$t('network.text_229'),
        },
        {
          field: 'associate_id',
          title: this.$t('network.text_234'),
        },
      ],
      columns: [
        {
          field: 'ip_addr',
          title: 'IP',
        },
        {
          field: 'network',
          title: this.$t('network.text_235'),
        },
        {
          field: 'networkinterface_id',
          title: this.$t('network.text_236'),
        },
        {
          field: 'primary',
          title: this.$t('network.text_237'),
          formatter: ({ cellValue }) => {
            return cellValue ? this.$t('network.text_238') : this.$t('network.text_239')
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('network.text_240'),
          field: 'networks',
          slots: {
            default: ({ row }, h) => {
              return [
                <vxe-grid class="mb-2" data={ row.networks } columns={ this.columns } />,
              ]
            },
          },
        },
      ],
    }
  },
}
</script>
