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
  name: 'LoadbalancerbackendgroupsList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    resId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'loadbalancerbackendgroups',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      groupActions: [
        {
          label: '新建',
          permission: 'lb_loadbalancerbackendgroups_create',
          action: () => {
            this.createDialog('LoadbalancerbackendgroupsCreateDialog', {
              title: '新建',
              loadbalancer: this.resId,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: this.$store.getters.isAdminMode,
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
      this.sidePageTriggerHandle(this, 'LoadbalancerbackendgroupSidePage', {
        id: row.id,
        resource: 'loadbalancerbackendgroups',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
