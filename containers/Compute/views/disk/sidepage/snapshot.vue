<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import expectStatus from '@/constants/expectStatus'
import i18n from '@/locales'
import SingleActionsMixin from '@Compute/views/snapshot/mixins/singleActions'
import ListMixin from '@/mixins/list'

const DISK_TYPES = {
  sys: i18n.t('compute.text_49'),
  data: i18n.t('compute.text_50'),
  'swap-swap': i18n.t('compute.text_51'),
}

export default {
  name: 'snapshotListSidepage',
  mixins: [WindowsMixin, SingleActionsMixin, ListMixin],
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
        id: 'SnapshotListForDiskSidePage',
        resource: 'snapshots',
        steadyStatus: Object.values(expectStatus.disk).flat(),
        getParams: { details: true, disk_id: this.resId },
        filterOptions: {
          name: {
            label: this.$t('compute.text_415'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          disk_name: {
            label: this.$t('compute.text_100'),
            filter: true,
            formatter: val => {
              return `disk_name.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({ field: 'name', title: this.$t('compute.text_415') }),
        {
          field: 'disk_name',
          title: this.$t('compute.text_100'),
          minWidth: 50,
        },
        getBrandTableColumn(),
        {
          field: 'size',
          title: this.$t('compute.text_397'),
          minWidth: 50,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'disk_type',
          title: this.$t('compute.text_381'),
          width: 70,
          formatter: ({ cellValue }) => {
            return DISK_TYPES[cellValue]
          },
        },
        getStatusTableColumn({ statusModule: 'snapshot' }),
        {
          field: 'guest',
          title: this.$t('compute.text_463'),
          minWidth: 100,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              return [
                <div class='text-truncate'>
                  {row.guest}
                  {row.guest_status ? <status status={ row.guest_status } statusModule='server'/> : ''}
                </div>,
              ]
            },
          },
        },
        {
          field: 'created_at',
          title: this.$t('compute.text_243'),
          minWidth: 70,
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('compute.text_282'),
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['running', 'ready'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => ({
            validate: this.list.selected.length,
          }),
        },
        {
          label: this.$t('compute.text_261'),
          permission: 'snapshots_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              title: this.$t('compute.text_261'),
              name: this.$t('compute.text_462'),
            })
          },
          meta: () => {
            const ret = {
              validate: this.list.selected.length,
              tooltip: null,
            }
            if (this.list.selectedItems.some(item => !item.can_delete)) {
              ret.validate = false
              return ret
            }
            if (this.list.selectedItems.some(item => item.is_sub_snapshot)) {
              ret.validate = false
              ret.tooltip = this.$t('compute.text_1062')
              return ret
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
