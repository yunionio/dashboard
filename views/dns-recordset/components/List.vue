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
  name: 'DnsRecordSetList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    data: {
      type: Object,
    },
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'dns_recordsets',
        getParams: {
          ...this.getParams,
          details: true,
        },
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
          { label: this.$t('common_664'), key: 'name' },
          { label: this.$t('network.text_160'), key: 'dns_type' },
          { label: this.$t('network.text_152'), key: 'dns_value' },
          { label: this.$t('common_665'), key: 'ttl' },
          { label: this.$t('common_285'), key: 'enabled' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          action: () => {
            this.createDialog('DnsRecordSetCreateDialog', {
              title: this.$t('common_666'),
              data: this.list.selectedItems,
              detailData: this.data,
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
    this.initSidePageTab('dns-recordset-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DnsRecordSetSidePage', {
        id: row.id,
        resource: 'dns_recordsets',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
