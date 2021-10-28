<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    status-module="webapp"
    resource="webapps" />
</template>

<script>
import {
  getTypeTableColumn,
  getKindTableColumn,
  getTechStackTableColumn,
} from '../utils/columns'
import {
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'

export default {
  name: 'WebAppDetail',
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
        getUserTagColumn({ onManager: this.onManager, resource: 'webapp', columns: () => this.columns, tipName: this.$t('compute.text_100') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'webapp', columns: () => this.columns, tipName: this.$t('compute.text_100') }),
        getBrandTableColumn(),
        getTypeTableColumn(),
        getKindTableColumn(),
        getTechStackTableColumn(),
      ],
    }
  },
  methods: {
  },
}
</script>
