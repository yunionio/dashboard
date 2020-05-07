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
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter } from '@/utils/common/tableFilter'

export default {
  name: 'LoadbalancerlistenerList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    data: { // LB实例
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'LoadbalancerListenerList',
        resource: 'loadbalancerlisteners',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      groupActions: [
        {
          label: '新建',
          permission: 'lb_loadbalancerlisteners_create',
          action: () => {
            const query = {
              type: this.data.provider,
            }
            if (query.type === 'Aws') {
              query.spec = this.data.loadbalancer_spec
            }
            this.$router.push({
              path: `/lb/${this.data.id}/listener-create`,
              query,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          permission: 'lb_loadbalancerlisteners_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
              name: '监听',
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
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
      this.sidePageTriggerHandle(this, 'LoadbalancerlistenerSidePage', {
        id: row.id,
        resource: 'loadbalancerlisteners',
        getParams: this.getParam,
        rowData: row,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
