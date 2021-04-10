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
        getUserTagColumn({ onManager: this.onManager, resource: 'access_group', columns: () => this.columns, tipName: this.$t('dictionary.access_group') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'access_group', columns: () => this.columns, tipName: this.$t('dictionary.access_group') }),
        getPublicScopeTableColumn({ vm: this, resource: 'access_groups' }),
      ],
    }
  },
}
</script>
