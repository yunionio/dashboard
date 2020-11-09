<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
// import { getNameFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'StrategyAllocationList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'scopedpolicybindings',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: { field: 'policy_name', label: this.$t('table.title.name') },
        },
      }),
      groupActions: [
        {
          label: this.$t('cloudenv.text_108'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('cloudenv.text_108'),
              name: this.$t('dictionary.strategyallocation'),
              onManager: this.onManager,
              success: () => {
                window.location.reload()
              },
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
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'StrategyAllocationSidePage', {
        id: row.id,
        resource: 'scopedpolicybindings',
        apiVersion: 'v1',
        getParams: this.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
