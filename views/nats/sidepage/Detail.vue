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
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import WindowsMixin from '@/mixins/windows'

const BillingType = {
  postpaid: i18n.t('network.text_533'),
  prepaid: i18n.t('network.text_534'),
}

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
        {
          field: 'region',
          title: this.$t('network.text_199'),
        },
      ],
      extraInfo: [
        {
          title: this.$t('network.text_38'),
          items: [
            {
              field: 'manager_project',
              title: this.$t('network.text_43'),
              formatter: ({ cellValue }) => {
                return cellValue || '-'
              },
            },
            {
              field: 'billing_type',
              title: this.$t('network.text_537'),
              formatter: ({ cellValue }) => {
                return BillingType[cellValue]
              },
            },
          ],
        },
      ],
    }
  },
}
</script>
