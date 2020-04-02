<template>
  <detail
    :data="data"
    :showDesc="!isDirect"
    :onManager="onManager"
    :base-info="baseInfo" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'ProxysettingDetail',
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
          field: 'https_proxy',
          title: 'https代理',
        }),
        getCopyWithContentTableColumn({
          field: 'http_proxy',
          title: 'http代理',
        }),
        getCopyWithContentTableColumn({
          field: 'no_proxy',
          title: '不走代理地址',
        }),
      ],
    }
  },
  computed: {
    isDirect () {
      return this.data.id === 'DIRECT'
    },
  },
}
</script>
