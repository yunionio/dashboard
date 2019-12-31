<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getStatusTableColumn,
  getBrandTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'CacheList',
  mixins: [WindowsMixin],
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
        },
        getStatusTableColumn({ statusModule: 'secgroupCache' }),
        {
          field: 'created_at',
          title: '创建时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        {
          field: 'updated_at',
          title: '更新时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        {
          field: 'vpc',
          title: 'VPC',
          formatter: ({ cellValue }) => {
            return cellValue || '-'
          },
        },
        getBrandTableColumn(),
        getRegionTableColumn(),
        {
          field: 'account',
          title: '云账号',
        },
      ],
      singleActions: [
        {
          label: '删除',
          permission: 'server_perform_assign_secgroup',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除',
              list: this.list,
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
