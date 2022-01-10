<template>
  <page-list
    :list="list"
    show-tag-columns
    show-tag-filter
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
          { label: this.$t('table.title.enable_status'), key: 'enabled' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'dns_recordsets_create',
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
            const ret = { ...this.$isOwner(this.data), buttonType: 'primary' }
            if (!ret.validate) return ret
            return ret
          },
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              {
                label: this.$t('compute.text_283'),
                permission: 'dns_recordsets_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    params: {
                      resources: 'dns_recordsets',
                    },
                    mode: 'add',
                  })
                },
              },
              ...getEnabledSwitchActions(this, undefined, ['dns_recordsets_enable', 'dns_recordsets_disable']),
              {
                label: this.$t('network.text_131'),
                permission: 'dns_recordsets_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: this.$t('network.text_131'),
                    name: this.$t('common_663'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = { ...this.$isOwner(this.data) }
                  if (!ret.validate) return ret
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
