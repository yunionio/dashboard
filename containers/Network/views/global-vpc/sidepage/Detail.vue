<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="globalvpcs"
    statusModule="globalVpc" />
</template>

<script>
import {
  getPublicScopeTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'GlobalVPCDetail',
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
        getBrandTableColumn(),
        getAccountTableColumn(),
        getPublicScopeTableColumn({ vm: this, resource: 'globalvpcs' }),
        // {
        //   field: 'model',
        //   title: '设备型号',
        // },
      ],
    }
  },
}
</script>
