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
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { sizestr } from '@/utils/utils'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'DiskListForVmSnapshotPolicySidePage',
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
        resource: 'disks',
        steadyStatus: Object.values(expectStatus.disk).flat(),
        getParams: { ...this.getParams, 'filter.0': 'disk_type.notin(volume)', snapshotpolicy_id: this.resId },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'name',
          title: '名称',
          hideField: true,
          slotCallback: row => {
            return [<side-page-trigger permission="disks_get" name="DiskSidePage" id={row.id} vm={this}>{ row.name }</side-page-trigger>]
          },
        }),
        {
          field: 'disk_size',
          title: '容量',
          minWidth: 50,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        getStatusTableColumn({ statusModule: 'disk' }),
        {
          field: 'disk_type',
          title: '磁盘类型',
          width: 70,
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? '系统盘' : '数据盘'
          },
        },
        getRegionTableColumn(),
        {
          field: 'guest',
          title: this.$t('dictionary.server'),
          minWidth: 100,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              return [
                <div class='text-truncate'>
                  {row.guest}
                  {row.guest_status ? <status status={ row['guest_status'] } statusModule='server'/> : ''}
                </div>,
              ]
            },
          },
        },
      ],
      singleActions: [
        {
          label: '解绑',
          action: obj => {
            this.createDialog('UnbindDisksDialog', {
              data: [obj],
              columns: this.columns,
              title: '解绑',
              resId: this.resId,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: obj => {
            const ret = {
              validate: true,
              tooltip: null,
            }
            return ret
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
