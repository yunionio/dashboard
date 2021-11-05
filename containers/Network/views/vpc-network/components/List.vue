<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import {
  getStatusFilter,
  getInBrandFilter,
} from '@/utils/common/tableFilter'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'VpcNetworkList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    const scopeResource = this.$store.getters.scopeResource
    const l3PermissionEnable = this.$store.getters.l3PermissionEnable

    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'inter_vpc_networks',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.vpcNetwork).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('vpcNetwork'),
          brand: getInBrandFilter('brands', ['Aliyun', 'Qcloud']),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_27'), key: 'status' },
          { label: this.$t('common_715'), key: 'user_tags' },
          { label: 'VPC数量', key: 'vpc_count' },
          {
            label: this.$t('common_101'),
            key: 'public_scope',
            hidden: () => {
              return !l3PermissionEnable && (scopeResource && scopeResource.domain.includes('inter_vpc_networks'))
            },
          },
          { label: this.$t('table.title.brand'), key: 'provider' },
        ],
      },
      groupActions: [],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'VpcNetworkSidePage', {
        id: row.id,
        resource: 'inter_vpc_networks',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
