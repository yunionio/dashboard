<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="nat" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
  getBrandTableColumn,
  getBillingTypeTableColumn,

} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'NatDetail',
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
        getPublicScopeTableColumn({ vm: this, resource: 'natgateways' }),
        getCopyWithContentTableColumn({ field: 'vpc', title: this.$t('network.text_535') }),
        getBrandTableColumn(),
        getBillingTypeTableColumn(),
        {
          field: 'region',
          title: this.$t('network.text_199'),
        },
        {
          field: 'network',
          title: this.$t('network.text_551'),
          slots: {
            default: ({ row }) => {
              return row.network || '-'
            },
          },
        },
        {
          field: 'ip_addr',
          title: this.$t('network.text_558'),
          slots: {
            default: ({ row }) => {
              return row.ip_addr || '-'
            },
          },
        },
      ],
      extraInfo: [
      ],
    }
  },
}
</script>
