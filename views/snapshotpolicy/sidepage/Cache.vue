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
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'CacheListForVmSnapshotPolicySidePage',
  mixins: [WindowsMixin],
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
        getCopyWithContentTableColumn({ field: 'name', title: '策略名称' }),
        getStatusTableColumn({ statusModule: 'snapshotpolcyCache' }),
        getTimeTableColumn(),
        getTimeTableColumn({ field: 'updated_at', title: '更新时间' }),
        getBrandTableColumn(),
        getRegionTableColumn(),
        getAccountTableColumn(),
      ],
      singleActions: [
        {
          label: '删除',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: '删除',
              onManager: this.list.onManager,
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
