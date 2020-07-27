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
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  name: 'DNSList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'dnsrecords',
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_152'), key: 'records' },
          { label: 'TTL', key: 'ttl' },
          { label: this.$t('network.text_153'), key: 'enabled' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          action: () => {
            this.createDialog('DnsCreateDialog', {
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
              ...getEnabledSwitchActions(this),
              {
                label: this.$t('network.text_131'),
                permission: 'vpcs_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: this.$t('network.text_131'),
                    name: this.$t('dictionary.dnsrecord'),
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
    this.initSidePageTab('dns-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DNSSidePage', {
        id: row.id,
        resource: 'dnsrecords',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
