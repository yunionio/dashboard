<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import {
  getDevTypeColumn,
  getModelColumn,
  getVendorIdColumn,
  getDeviceIdColumn,
} from '../utils/columns'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'PciDetail',
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
        getDevTypeColumn(),
        getModelColumn(),
        getVendorIdColumn(),
        getDeviceIdColumn(),
      ],
    }
  },
}
</script>
