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
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'LoadbalancerlistenerruleList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    data: { // 监听的数据
      type: Object,
      required: true,
    },
    lbData: { // lb实例的数据
      type: Object,
    },
  },
  data () {
    let groupActions = []
    const provider = R.path(['provider'], this.lbData)
    if (provider && (provider.toLowerCase() !== 'azure' && provider.toLowerCase() !== 'google')) {
      groupActions = [
        {
          label: this.$t('network.text_26'),
          permission: 'lb_loadbalancerlistenerrules_create',
          action: () => {
            this.createDialog('LoadbalancerlistenerruleCreateDialog', {
              title: this.$t('network.text_26'),
              data: this.list.selectedItems,
              onManager: this.onManager,
              refresh: this.refresh,
              lbListenerData: this.data,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ]
    }

    return {
      list: this.$list.createList(this, {
        id: 'LoadbalancerListenerRuleList',
        resource: 'loadbalancerlistenerrules',
        getParams: this.getParam,
        fetchDataCb: this.fetchDataCb,
        filterOptions: {
          name: getNameFilter(),
        },
        steadyStatus: {
          status: Object.values(expectStatus.lb).flat(),
        },
      }),
      groupActions: groupActions,
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    fetchDataCb () {
      if (this.list.total > 0 && this.data.provider === 'Google') {
        for (const item in this.list.data) {
          const data = this.list.data[item].data
          data.provider = this.data.provider
          data.cloudregion = this.data.cloudregion
          data.cloudregion_id = this.data.cloudregion_id
          data.region = this.data.region
          data.region_ext_id = this.data.region_ext_id
          data.region_external_id = this.data.region_external_id
          data.region_id = this.data.region_id
        }
      }
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'LoadbalancerlistenerruleSidePage', {
        id: row.id,
        resource: 'loadbalancerlistenerrules',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
