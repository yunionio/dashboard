<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
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
        resource: 'secgroupcaches',
        getParams: {
          details: true,
          secgroup: this.getParams.id,
        },
        filterOptions: {
          name: {
            label: '安全组名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        {
          field: 'name',
          title: '安全组名称',
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
          title: '创建时间',
          width: 150,
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        {
          field: 'updated_at',
          title: '更新时间',
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
          title: '云账号',
          width: 100,
        },
      ],
      singleActions: [
        {
          label: '删除',
          permission: 'secgroups_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: '删除',
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
