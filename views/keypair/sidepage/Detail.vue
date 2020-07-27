<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'KeyPairDetail',
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
        getCopyWithContentTableColumn({
          field: 'fingerprint',
          title: this.$t('compute.text_726'),
        }),
        {
          field: 'scheme',
          title: this.$t('compute.text_175'),
        },
        {
          field: 'linked_guest_count',
          title: this.$t('compute.text_699', [this.$t('dictionary.server')]),
        },
      ],
    }
  },
}
</script>
