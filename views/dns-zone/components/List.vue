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
          { label: this.$t('network.text_153'), key: 'enabled' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          action: () => {
            this.createDialog('DnsZoneCreateDialog', {
              title: this.$t('network.text_154'),
              data: this.list.selectedItems,
              onManager: this.onManager,
              refresh: this.refresh,
              type: 'create',
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
