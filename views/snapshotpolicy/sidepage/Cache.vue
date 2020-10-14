<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
  getBrandTableColumn,
  getRegionTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'CacheListForVmSnapshotPolicySidePage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'snapshotpolicycaches',
        steadyStatus: Object.values(expectStatus.snapshotpolcyCache).flat(),
        getParams: {
          snapshotpolicy_id: this.resId,
          brand: ['Qcloud', 'Aliyun'],
        },
      }),
      columns: [
        getCopyWithContentTableColumn({ field: 'name', title: this.$t('compute.text_428') }),
        getStatusTableColumn({ statusModule: 'snapshotpolcyCache' }),
        getTimeTableColumn(),
        getTimeTableColumn({ field: 'updated_at', title: this.$t('compute.text_691') }),
        getBrandTableColumn(),
        getRegionTableColumn(),
        getAccountTableColumn(),
      ],
      singleActions: [
        {
          label: this.$t('compute.text_261'),
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('compute.text_261'),
              onManager: this.onManager,
            })
          },
          meta: obj => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
