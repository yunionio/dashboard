<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getRegionFilter, getBrandFilter, getAccountFilter } from '@/utils/common/tableFilter'
import {
  getStatusTableColumn,
  getBrandTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'CacheList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    getParams: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.getParams.listId,
        resource: 'secgroupcaches',
        getParams: {
          details: true,
          secgroup: this.getParams.id,
        },
        filterOptions: {
          name: {
            label: this.$t('compute.text_988'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          region: getRegionFilter(),
          cloudaccount: getAccountFilter(),
          brand: getBrandFilter('brands', ['VMware', 'OneCloud']),
        },
      }),
      columns: [
        {
          field: 'name',
          title: this.$t('compute.text_988'),
          minWidth: 100,
          showOverflow: 'title',
          slots: {
            default: ({ row }, h) => {
              const { name } = row
              return [
                <div class='text-truncate' title={ name }>
                  { name }
                </div>,
              ]
            },
          },
        },
        getStatusTableColumn({ statusModule: 'secgroupCache' }),
        {
          field: 'created_at',
          title: this.$t('compute.text_243'),
          width: 150,
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        {
          field: 'updated_at',
          title: this.$t('compute.text_691'),
          width: 150,
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        {
          field: 'vpc',
          title: 'VPC',
          minWidth: 70,
          showOverflow: 'ellipsis',
          formatter: ({ cellValue }) => {
            return cellValue || '-'
          },
        },
        getBrandTableColumn(),
        getRegionTableColumn(),
        {
          field: 'account',
          title: this.$t('compute.text_269'),
          width: 100,
        },
      ],
      singleActions: [
        {
          label: this.$t('compute.perform_delete'),
          permission: 'secgroups_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              alert: this.$t('compute.text_1396'),
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
