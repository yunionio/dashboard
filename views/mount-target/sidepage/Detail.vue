<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'MountTargetDetail',
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
        getUserTagColumn({ onManager: this.onManager, resource: 'mount_target', columns: () => this.columns, tipName: this.$t('dictionary.mount_target') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'mount_target', columns: () => this.columns, tipName: this.$t('dictionary.mount_target') }),
      ],
    }
  },
}
</script>
