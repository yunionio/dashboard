<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :expand-config="{ lazy: true, loadMethod: loadListeners, accordion: true }" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'

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
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'LoadbalancerBackendgroupList',
        resource: 'loadbalancerbackendgroups',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
        },
        steadyStatus: {
          status: Object.values(expectStatus.lb).flat(),
        },
      }),
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'lb_loadbalancerbackendgroups_create',
          action: () => {
            this.createDialog('LoadbalancerbackendgroupsCreateDialog', {
              title: this.$t('network.text_26'),
              loadbalancer: this.resId,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('network.text_131'),
          permission: 'lb_loadbalancerbackendgroups_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('network.text_131'),
              name: this.$t('network.text_139'),
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
      this.sidePageTriggerHandle(this, 'LoadbalancerbackendgroupSidePage', {
        id: row.id,
        resource: 'loadbalancerbackendgroups',
        getParams: this.getParam,
        lbData: this.data,
      }, {
        list: this.list,
      })
    },
    async loadListeners ({ row }) {
      const manager = new this.$Manager('loadbalancerlisteners')
      try {
        const params = {
          backend_group: row.id,
          scope: this.$store.getters.scope,
          limit: 0,
        }
        const ret = await manager.list({
          params,
        })
        row.listeners = ret.data.data || []
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
