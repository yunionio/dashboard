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
            label: '名称',
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
          { label: '名称', key: 'name' },
          { label: '记录值', key: 'records' },
          { label: 'TTL', key: 'ttl' },
          { label: '启用状态', key: 'enabled' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('DnsCreateDialog', {
              title: '新建',
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
                label: '删除',
                permission: 'vpcs_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: '删除',
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
