<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'

export default {
  name: 'SnapshotList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    list: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      mixinType: 'instance',
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '硬盘', key: 'disk_name' },
          { label: '磁盘类型', key: 'disk_type' },
          { label: '快照大小', key: 'size' },
          { label: '状态', key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'provider' },
          { label: '虚拟机', key: 'guest' },
          { label: '创建时间', key: 'create_at' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
          { label: '存储方式', key: 'storage_type' },
        ],
      },
      groupActions: [
        {
          label: '删除',
          permission: 'snapshots_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              title: '删除',
              name: '快照',
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
              ret.tooltip = '此快照为主机快照子快照，不可操作'
              return ret
            }
            return ret
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('snapshot-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SnapshotInstanceSidePage', {
        id: row.id,
        resource: 'instance_snapshots',
        getParams: this.list.params,
        steadyStatus: this.list.steadyStatus,
      }, {
        list: this.list,
        type: 'instance',
      })
    },
  },
}
</script>
