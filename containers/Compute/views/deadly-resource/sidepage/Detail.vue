<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="billing_resource_checks"
    status-module="deadly_resource" />
</template>

<script>
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DeadlyResourceDetail',
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
        getUserTagColumn({
          onManager: this.onManager,
          resource: 'billing_resource_checks',
          columns: () => this.columns,
          tipName: this.$t('compute.deadly_resource'),
        }),
        getExtTagColumn({
          onManager: this.onManager,
          resource: 'billing_resource_checks',
          columns: () => this.columns,
          tipName: this.$t('compute.deadly_resource'),
        }),
        {
          field: 'status',
          title: this.$t('table.title.status'),
          formatter: ({ row }) => {
            return row.status || '-'
          },
        },
      ],
    }
  },
}
</script>
