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
          title: '指纹',
        }),
        {
          field: 'scheme',
          title: '类型',
        },
        {
          field: 'linked_guest_count',
          title: `关联${this.$t('dictionary.server')}数量`,
        },
      ],
    }
  },
}
</script>
