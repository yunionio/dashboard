<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import {
  getDefaultStrategyTableColumn,
  getResourceTypeTableColumn,
  getResourceCountTableColumn,
  getDynamicSchedtagCountTableColumn,
  getSchedpolicyCountTableColumn,
} from '../utils/columns'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'

export default {
  name: 'SchedtagDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    columns: Array,
  },
  data () {
    return {
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'schedtag', columns: () => this.columns, tipName: this.$t('cloudenv.text_18') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'schedtag', columns: () => this.columns, tipName: this.$t('cloudenv.text_18') }),
        getDefaultStrategyTableColumn(),
        getResourceTypeTableColumn(),
        getResourceCountTableColumn(),
        getDynamicSchedtagCountTableColumn(),
        getSchedpolicyCountTableColumn(),
      ],
    }
  },
}
</script>
