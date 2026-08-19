<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import * as R from 'ramda'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getDescriptionFilter, getRegionFilter, getAccountFilter, getInBrandFilter, getTenantFilter, getStatusFilter } from '@/utils/common/tableFilter'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { getIpSetSupportBrands } from '../constants'

export default {
  name: 'IpSetList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
      default: () => ({}),
    },
    cloudEnv: String,
    cloudEnvOptions: {
      type: Array,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'ipsets',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.ipset).flat(),
        filterOptions: {
          name: getNameFilter(),
          description: getDescriptionFilter(),
          id: {
            label: 'ID',
          },
          status: getStatusFilter('ipset'),
          region: getRegionFilter(),
          cloudaccount: getAccountFilter(),
          brand: getInBrandFilter('brands', getIpSetSupportBrands()),
          projects: getTenantFilter(),
        },
      }),
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
          permission: 'ipsets_create',
          action: () => {
            this.createDialog('EditIpSetsDialog', {
              title: 'create',
              data: [{}],
              cloudEnv: this.cloudEnv,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: !this.cloudEnvEmpty,
              tooltip: this.cloudEnvEmpty ? this.$t('common.no_platform_available') : '',
            }
          },
        },
        {
          label: this.$t('compute.perform_delete'),
          permission: 'ipsets_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
              name: this.$t('compute.title.ipset'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  watch: {
    cloudEnv () {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
  },
}
</script>
