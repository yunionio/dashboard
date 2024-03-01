<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    show-tag-config
    :list="list"
    :columns="columns"
    :showSearchbox="showSearchbox"
    :export-data-options="exportDataOptions"
    :tag-config-params="tagConfigParams" />
</template>

<script>
import * as R from 'ramda'
import { surpportLb } from '@Network/views/lb/constants'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import {
  getNameFilter,
  getBrandFilter,
  getTenantFilter,
  getDomainFilter,
  getAccountFilter,
  getStatusFilter,
  getCloudProviderFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import ColumnsMixin from '@Network/views/lb/mixins/columns'

export default {
  name: 'LbList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    const allBrandsFilter = getBrandFilter()
    const filterOptions = {
      external_id: {
        label: this.$t('table.title.external_id'),
      },
      id: {
        label: this.$t('table.title.id'),
      },
      name: getNameFilter(),
      description: getDescriptionFilter(),
      status: getStatusFilter('lb'),
      address: {
        label: this.$t('network.text_248'),
      },
      brand: {
        ...allBrandsFilter,
        items: allBrandsFilter.items.filter(val => surpportLb.includes(val.key.toLowerCase())),
      },
      projects: getTenantFilter(),
      project_domains: getDomainFilter(),
      cloudaccount: getAccountFilter(),
      manager: getCloudProviderFilter(),
      region: {
        label: this.$t('dashboard.text_101'),
      },
      zone: {
        label: this.$t('compute.text_270'),
        hiddenField: 'region',
      },
      created_at: getCreatedAtFilter(),
    }
    const { path } = this.$route
    if (path.includes('/cluster')) {
      delete filterOptions.brand
      delete filterOptions.cloudaccount
    }
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'loadbalancers',
        getParams: this.getParam,
        filterOptions,
        steadyStatus: {
          status: Object.values(expectStatus.lb).flat(),
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'account', 'cluster', 'created_at'],
        autoHiddenFilterKey: 'slb_hidden_columns',
      }),
      tagConfigParams: {
        resource: 'loadbalancers',
        queryTreeId: 'project-tag-value-tree',
      },
    }
  },
  computed: {
    exportDataOptions () {
      return {
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
        title: this.$t('network.text_714'),
        downloadType: 'local',
      }
    },
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
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'LbSidePage', {
        id: row.id,
        resource: 'loadbalancers',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.lb).flat(),
        },
      }, {
        row: row,
        list: this.list,
        tab,
      })
    },
  },
}
</script>
