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
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

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
    let groupActions = []
    const provider = R.path(['provider'], this.data)
    if (provider && (provider.toLowerCase() !== 'azure' && provider.toLowerCase() !== 'google')) {
      groupActions = [
        {
          label: this.$t('network.text_26'),
          permission: 'lb_loadbalancerbackendgroups_create',
          action: () => {
            this.createDialog('LoadbalancerbackendgroupsCreateDialog', {
              title: this.$t('network.text_26'),
              loadbalancer: this.resId,
              lbData: this.data,
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
          meta: () => {
            if (this.list.selectedItems.length > 0) {
              const noAliyunDefaultBackendGroup = this.list.selectedItems.every((item) => !this.isAliyunDefaultBackendGroup(item))
              if (!noAliyunDefaultBackendGroup) {
                return {
                  validate: false,
                  tooltip: this.$t('network.lb.default_backendgroup.tips'),
                }
              }
            }
            this.$getDeleteResult(this.list.selectedItems)
          },
        },
      ]
    }

    return {
      list: this.$list.createList(this, {
        id: 'LoadbalancerBackendgroupList',
        resource: 'loadbalancerbackendgroups',
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
    isAliyunDefaultBackendGroup (obj) {
      const provider = obj && obj.provider ? obj.provider : ''
      if (provider.toLowerCase() === 'aliyun' && obj.type === 'default') {
        return true
      }
      return false
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        details: true,
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
