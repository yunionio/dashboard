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
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_1081'), key: 'snapshots' },
          { label: this.$t('compute.text_422'), key: 'size' },
          { label: this.$t('compute.text_268'), key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('compute.text_91'), key: 'guest' },
        ],
      },
      groupActions: [
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
