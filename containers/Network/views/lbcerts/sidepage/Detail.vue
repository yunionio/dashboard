<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import {
  isPublicTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'LbcertDetail',
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
        isPublicTableColumn(),
        {
          field: 'fingerprint',
          title: this.$t('network.text_332'),
          showOverflow: 'ellipsis',
          width: '120px',
          slots: {
            default: ({ row, cellValue }, h) => {
              const ret = [<list-body-cell-wrap row={ row } field="fingerprint" />]
              return ret
            },
          },
        },
        {
          field: 'common_name',
          title: this.$t('network.text_318'),
        },
        {
          field: 'not_after',
          title: this.$t('network.text_319'),
        },
      ],
      extraInfo: [],
    }
  },
}
</script>
