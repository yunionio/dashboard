<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter, getStatusFilter, getEnabledFilter } from '@/utils/common/tableFilter'
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
          name: getNameFilter(),
          status: getStatusFilter('sku'),
          enabled: getEnabledFilter(),
          cpu_core_count: {
            label: this.$t('compute.text_1051'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'cpu_core_count',
            },
            mapper: (data) => {
              return R.sort((a, b) => { return a.key - b.key }, data.map(({ key }) => {
                return { label: this.$t('compute.text_120', [key]), key }
              }))
            },
          },
          memory_size_mb: {
            label: this.$t('compute.text_1052'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'memory_size_mb',
            },
            mapper: (data) => {
              return R.sort((a, b) => { return a.key - b.key }, data.map(({ key }) => {
                return { label: sizestr(key, 'M', 1024), key }
              }))
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_1051'), key: 'cpu_core_count' },
          { label: this.$t('compute.text_1052'), key: 'memory_size_mb' },
          { label: this.$t('compute.text_268'), key: 'status' },
          { label: this.$t('compute.text_699', [this.$t('dictionary.server')]), key: 'total_guest_count' },
          { label: this.$t('compute.text_241'), key: 'enabled' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.text_18'),
          permission: 'skus_create',
          action: () => {
            this.createDialog('CreateSkuDialog', {
              title: this.$t('compute.text_18'),
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
                label: this.$t('compute.text_261'),
                permission: 'skus_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('compute.text_1053'),
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
