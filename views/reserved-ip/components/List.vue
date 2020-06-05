<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ReservedIPList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    data: Object,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'reservedips',
        getParams: this.getParam,
        filterOptions: {
          ip_addr: {
            label: 'IP地址',
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: 'IP子网', key: 'network' },
          { label: 'IP地址', key: 'ip_addr' },
          { label: '备注', key: 'notes' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('ReservedIpCreateDialog', {
              title: '新建',
              onManager: this.onManager,
              refresh: this.refresh,
              network: this.data,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '释放',
          permission: 'reservedips_delete',
          action: () => {
            this.createDialog('ReservedIPFreedDialog', {
              title: '释放',
              onManager: this.onManager,
              refresh: this.refresh,
              columns: this.columns,
              data: this.list.selectedItems,
              name: '预留IP',
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        ...this.getParams,
      }
      return ret
    },
  },
}
</script>
