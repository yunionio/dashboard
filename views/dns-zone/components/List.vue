<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import {
  getDomainFilter,
  getStatusFilter,
} from '@/utils/common/tableFilter'

export default {
  name: 'DnsZoneList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'dns_zones',
        steadyStatus: {
          status: Object.values(expectStatus.dnszone).flat(),
        },
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('dnszone'),
          zone_type: {
            label: this.$t('network.text_717'),
            dropdown: true,
            multiple: true,
            items: [
              { label: 'PublicZone', key: 'PublicZone' },
              { label: 'PrivateZone', key: 'PrivateZone' },
            ],
            filter: true,
            formatter: val => {
              return `zone_type.contains("${val}")`
            },
          },
          project_domains: getDomainFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_717'), key: 'zone_type' },
          { label: this.$t('network.text_718'), key: 'dns_recordset_count' },
          { label: this.$t('network.text_719'), key: 'vpc_count' },
          { label: this.$t('network.text_27'), key: 'status' },
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
          label: this.$t('network.text_26'),
          action: () => {
            this.createDialog('DnsZoneCreateDialog', {
              title: '新建DNS解析',
              data: this.list.selectedItems,
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
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              {
                label: this.$t('network.text_131'),
                permission: 'dns_zones_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: this.$t('network.text_131'),
                    name: this.$t('dictionary.dnszone'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('dns-zone-detail')
    this.list.fetchData()
    this.$bus.$on('DnsZoneListSingleRefresh', (...arg) => {
      this.list.singleRefresh(...arg)
    }, false)
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DnsZoneSidePage', {
        id: row.id,
        resource: 'dns_zones',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
