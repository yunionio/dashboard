<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :hidden-keys="['status']" />
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
<style scoped lang="less">
@import '~@/styles/less/theme';

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: relative;
  display: inline-flex;
}

.success {
  background-color: @success-color;
}
.danger {
  background-color: @error-color;
}
.info {
  background-color: @normal-color;
}
.warning {
  background-color: @warning-color;
}
</style>
