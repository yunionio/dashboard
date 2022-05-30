<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getBrandFilter, getCloudProviderFilter, getTenantFilter, getDomainFilter, getAccountFilter, getStatusFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'Ipv6GatewayList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    const filterOptions = {
      external_id: {
        label: this.$t('table.title.external_id'),
      },
      id: {
        label: this.$t('table.title.id'),
      },
      name: getNameFilter(),
      status: getStatusFilter('ipv6_gateway'),
      instance_type: {
        label: this.$t('network.text_268'),
        formatter: (val) => {
          return `instance_type.contains("${val}")`
        },
      },
      vpc: {
        label: 'VPC',
        formatter: (val) => {
          return `vpc.contains("${val}")`
        },
        hidden: this.$store.getters.isProjectMode,
      },
      brand: getBrandFilter(),
      projects: getTenantFilter(),
      project_domains: getDomainFilter(),
      cloudaccount: getAccountFilter(),
      provider: getCloudProviderFilter(),
      region: {
        label: this.$t('dashboard.text_101'),
      },
      created_at: getCreatedAtFilter(),
    }
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'ipv6_gateways',
        getParams: this.getParam,
        filterOptions,
        steadyStatus: {
          status: Object.values(expectStatus.ipv6_gateway).flat(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.external_id'), key: 'external_id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: 'VPC', key: 'vpc', hidden: this.$store.getters.isProjectMode },
          { label: this.$t('network.text_27'), key: 'status' },
          { label: this.$t('network.text_268'), key: 'instance_type' },
          { label: this.$t('dictionary.domain'), key: 'project_domain', hidden: this.$store.getters.isProjectMode },
          { label: this.$t('network.text_43'), key: 'tenant' },
          { label: this.$t('network.text_199'), key: 'region' },
          { label: this.$t('network.text_196'), key: 'account', hidden: this.$store.getters.isProjectMode },
          { label: this.$t('table.title.create_time'), key: 'created_at' },
        ],
      },
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
      this.sidePageTriggerHandle(this, 'Ipv6GatewaySidePage', {
        id: row.id,
        resource: 'ipv6_gateways',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.ipv6_gateway).flat(),
        },
      }, {
        row: row,
        list: this.list,
      })
    },
  },
}
</script>
