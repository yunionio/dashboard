<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    statusModule="tablestore"
    resource="tablestores" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'TablestoreDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    refresh: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    columns: {
      type: Array,
    },
  },
  data () {
    return {
      baseInfo: [
        getBrandTableColumn(),
      ],
    }
  },
}
</script>
