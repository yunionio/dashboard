<template>
  <detail
    :on-manager="onManager"
    :data="data"
    statusModule="accessGroup"
    :base-info="baseInfo" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { getPublicScopeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'AccessGroupDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    columns: Array,
    hiddenColumns: Array,
  },
  data () {
    return {
      baseInfo: [
        getPublicScopeTableColumn({ vm: this, resource: 'access_groups' }),
      ],
    }
  },
}
</script>
