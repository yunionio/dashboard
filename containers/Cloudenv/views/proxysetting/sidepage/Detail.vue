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
  getPublicScopeTableColumn,
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
        getPublicScopeTableColumn({ vm: this, resource: 'proxysettings' }),
        getCopyWithContentTableColumn({
          field: 'https_proxy',
          title: this.$t('cloudenv.text_395'),
        }),
        getCopyWithContentTableColumn({
          field: 'http_proxy',
          title: this.$t('cloudenv.text_398'),
        }),
        getCopyWithContentTableColumn({
          field: 'no_proxy',
          title: this.$t('cloudenv.text_401'),
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
