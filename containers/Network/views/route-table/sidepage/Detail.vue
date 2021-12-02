<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="route_tables"
    statusModule="routeTable"
    :hiddenKeys="['tenant', 'zone']" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getVpcTableColumn,
} from '../utils/columns'

export default {
  name: 'RouteTableDetail',
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
    columns: Array,
  },
  data () {
    return {
      baseInfo: [
        getVpcTableColumn(this),
      ],
      extraInfo: [],
    }
  },
}
</script>
