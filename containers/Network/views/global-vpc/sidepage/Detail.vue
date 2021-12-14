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
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
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
        getUserTagColumn({ onManager: this.onManager, resource: 'globalvpc', columns: () => this.columns, tipName: this.$t('dictionary.globalvpc') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'globalvpc', columns: () => this.columns, tipName: this.$t('dictionary.globalvpc') }),
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
