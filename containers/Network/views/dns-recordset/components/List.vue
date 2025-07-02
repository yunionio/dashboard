<template>
  <page-list
    :list="list"
    show-tag-columns
    show-tag-filter
    :columns="changedColumns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

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
        resource: 'dnsrecords',
        getParams: {
          ...this.getParams,
          details: true,
        },
        filterOptions: {
          name: {
            label: this.$t('common_664'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          dns_value: {
            label: this.$t('network.text_152'),
            filter: true,
            formatter: val => {
              return `dns_value.contains("${val}")`
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
          { label: this.$t('table.title.status'), key: 'status' },
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
  computed: {
    changedColumns () {
      return this.data.provider === 'Cloudflare' ? [...this.columns.filter(column => column.field !== 'traffic_policies'), {
        field: 'proxied',
        title: this.$t('network.proxy_status'),
        formatter: ({ row }) => {
          return row.proxied ? this.$t('network.proxy_exist') : this.$t('network.just_dns')
        },
      }] : this.columns
    },
    isAliyunEE () {
      return this.data.provider === 'Aliyun' && this.data.product_type === 'Enterprise'
    },
  },
  created () {
    this.initSidePageTab('dns-recordset-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DnsRecordSetSidePage', {
        id: row.id,
        resource: 'dnsrecords',
        dnsZoneData: this.data,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
