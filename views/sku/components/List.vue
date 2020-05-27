<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getStatusFilter, getEnabledFilter } from '@/utils/common/tableFilter'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import ListMixin from '@/mixins/list'

export default {
  name: 'SkuList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'serverskus',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('sku'),
          enabled: getEnabledFilter(),
          cpu_core_count: {
            label: '虚拟CPU核数',
            dropdown: true,
            multiple: false,
            distinctField: {
              type: 'field',
              key: 'cpu_core_count',
            },
            mapper: (data) => {
              return data.map(({ key }) => {
                return { label: `${key}核`, key }
              })
            },
          },
          memory_size_mb: {
            label: '虚拟内存容量',
            dropdown: true,
            multiple: false,
            distinctField: {
              type: 'field',
              key: 'memory_size_mb',
            },
            mapper: (data) => {
              return data.map(({ key }) => {
                return { label: sizestr(key, 'M', 1024), key }
              })
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '虚拟CPU核数', key: 'cpu_core_count' },
          { label: '虚拟内存容量', key: 'memory_size_mb' },
          { label: '状态', key: 'status' },
          { label: `关联${this.$t('dictionary.server')}数量`, key: 'total_guest_count' },
          { label: '启用状态', key: 'enabled' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'skus_create',
          action: () => {
            this.createDialog('CreateSkuDialog', {
              title: '新建',
              onManager: this.onManager,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              ...getEnabledSwitchActions(this, undefined, ['skus_update', 'skus_update']),
              {
                label: '删除',
                permission: 'skus_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除账号',
                    name: this.$t('dictionary.sku'),
                    onManager: this.onManager,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('sku-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        cloud_env: 'onpremise',
        ...this.getParams,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SkuSidePage', {
        id: row.id,
        resource: 'serverskus',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
