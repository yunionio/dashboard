<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import {
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SnatList',
  mixins: [ DialogMixin, WindowsMixin ],
  props: {
    resId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'natsentries',
        getParams: {
          natgateway: this.resId,
        },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
        steadyStatus: Object.values(expectStatus.nat).flat(),
      }),
      columns: [
        {
          field: 'name',
          title: 'SNAT名称',
        },
        {
          field: 'access_ip',
          title: '公网IP地址',
        },
        {
          field: 'sn',
          title: 'IP子网',
        },
        getStatusTableColumn({ statusModule: 'host' }),
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'server_create',
          action: () => {
            this.createDialog('CreateSnat', {
              title: '新建SNAT条目',
              data: this.data,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
      ],
      singleActions: [
        {
          label: '删除',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
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
