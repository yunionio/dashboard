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
import * as R from 'ramda'
import ColumnsMixin from '@Network/views/vpc/mixins/columns'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { getStatusFilter, getBrandFilter, getAccountFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DnsAssocoateVpcList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    id: String,
    data: {
      type: Object,
    },
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'vpcs',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.vpc).flat(),
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('vpc'),
          cloudaccount: getAccountFilter(),
          brand: getBrandFilter('brands', ['VMware']),
          cidr_block: {
            label: this.$t('network.text_244'),
          },
          project_domains: getProjectDomainFilter(),
          region: {
            label: this.$t('common_282'),
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_27'), key: 'status' },
          { label: this.$t('network.text_244'), key: 'cidr_block' },
          { label: this.$t('network.text_199'), key: 'region' },
          { label: this.$t('network.text_198'), key: 'provider' },
          { label: this.$t('network.text_196'), key: 'manager' },
          { label: this.$t('network.text_571'), key: 'wire_count' },
          { label: this.$t('network.text_682'), key: 'network_count' },
          {
            label: this.$t('common_101'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('vpcs'))
            },
          },
          { label: this.$t('network.text_233', [this.$t('dictionary.domain')]), key: 'project_domain' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_719'),
          permission: 'dns_zones_add_vpcs',
          action: () => {
            this.createDialog('AssociateVpcDialog', {
              title: this.$t('network.text_719'),
              data: [this.data],
              resData: this.data,
              columns: this.columns,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            const ret = { ...this.$isOwner(this.data), buttonType: 'primary' }
            if (!ret.validate) return ret
            if (!this.isAvailable) {
              ret.validate = false
              ret.tooltip = this.$t('network.text_730')
              return ret
            }
            return ret
          },
        },
        {
          label: this.$t('cloudenv.text_452'),
          permission: 'dns_zones_remove_vpcs',
          action: () => {
            this.createDialog('RemoveVpcDialog', {
              title: this.$t('cloudenv.text_452'),
              data: this.list.selectedItems,
              resData: this.data,
              columns: this.columns,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            const ret = this.$isOwner(this.data)
            if (!ret.validate) return ret
            if (!this.list.selectedItems.length) {
              ret.validate = false
              return ret
            }
            if (!this.isAvailable) {
              ret.validate = false
              ret.tooltip = this.$t('network.text_730')
              return ret
            }
            return ret
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('cloudenv.text_452'),
          permission: 'dns_zones_remove_vpcs',
          action: (obj) => {
            this.createDialog('RemoveVpcDialog', {
              title: this.$t('cloudenv.text_452'),
              data: [obj],
              resData: this.data,
              columns: this.columns,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: (obj) => {
            const ret = this.$isOwner(this.data)
            if (!ret.validate) return ret
            if (!this.isAvailable) {
              ret.validate = false
              ret.tooltip = this.$t('network.text_730')
              return ret
            }
            return ret
          },
        },
      ],
    }
  },
  computed: {
    isPublicZone () {
      return this.data.zone_type === 'PublicZone'
    },
    isAvailable () {
      return this.data.status === 'available'
    },
  },
  created () {
    this.initSidePageTab('vpc-detail')
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
      this.sidePageTriggerHandle(this, 'VpcSidePage', {
        id: row.id,
        resource: 'vpcs',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
