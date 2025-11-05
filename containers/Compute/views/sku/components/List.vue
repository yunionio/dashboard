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
import { getNameFilter, getStatusFilter, getEnabledFilter, getRegionFilter, getBrandFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import ListMixin from '@/mixins/list'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { findPlatform } from '@/utils/common/hypervisor'
import { SERVER_TYPE } from '../../../constants'

export default {
  name: 'SkuList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'serverskus',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          description: getDescriptionFilter(),
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
          region: getRegionFilter(),
          provider: getBrandFilter(),
          created_at: getCreatedAtFilter(),
        },
        hiddenColumns: ['prepaid_status', 'created_at'],
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
          { label: this.$t('common.createdAt'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
          permission: 'skus_create',
          action: () => {
            this.createDialog('CreateSkuDialog', {
              title: this.$t('compute.perform_create'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            const validate = this.cloudEnv !== 'public' && this.cloudEnv !== 'private'
            const meta = {
              buttonType: 'primary',
              validate,
              tooltip: validate ? '' : this.$t(`commpute.${this.cloudEnv}_sku_disable_tooltip`),
            }
            return meta
          },
        },
        {
          label: this.$t('commpute.sku_sync_title'),
          permission: 'cloudregions_perform_sync_skus', // 套餐这里因为接口是cloudregions的，所以权限也只能走cloudregions的
          action: () => {
            this.createDialog('SkuSyncDialog')
          },
          hidden: () => this.cloudEnv !== 'public',
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              ...getEnabledSwitchActions(this, undefined, ['skus_update', 'skus_update'], {
                extraMetas: [
                  () => {
                    let tooltip = ''
                    let validate = this.list.selectedItems.length > 0
                    if (this.list.selectedItems.some(item => {
                      const env = findPlatform(item.provider, 'provider')
                      if (env === SERVER_TYPE.private) {
                        return true
                      }
                      return false
                    })) {
                      validate = false
                      tooltip = this.$t('commpute.private_sku_disable_tooltip')
                    }
                    return {
                      validate,
                      tooltip,
                    }
                  },
                  () => {
                    let tooltip = ''
                    let validate = this.list.selectedItems.length > 0
                    if (this.list.selectedItems.some(item => {
                      const env = findPlatform(item.provider, 'provider')
                      if (env === SERVER_TYPE.private) {
                        return true
                      }
                      return false
                    })) {
                      validate = false
                      tooltip = this.$t('commpute.private_sku_disable_tooltip')
                    }
                    return {
                      validate,
                      tooltip,
                    }
                  },
                ],
              }),
              {
                label: this.$t('compute.sku.setup.sell.status'),
                permission: 'skus_update',
                action: () => {
                  this.createDialog('ServerSkuUpdateDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  let tooltip = ''
                  let validate = this.list.selectedItems.length > 0
                  if (this.list.selectedItems.some(item => {
                    const env = findPlatform(item.provider, 'provider')
                    if (env === SERVER_TYPE.private) {
                      return true
                    }
                    return false
                  })) {
                    validate = false
                    tooltip = this.$t('commpute.private_sku_disable_tooltip')
                  }
                  return {
                    validate,
                    tooltip,
                  }
                },
              },
              {
                label: this.$t('compute.perform_delete'),
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
                meta: () => {
                  return this.$getDeleteResult(this.list.selectedItems)
                },
              },
            ]
          },
        },
      ],
    }
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
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
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SkuSidePage', {
        id: row.id,
        resource: 'serverskus',
        getParams: this.getParam,
        cloudEnv: this.cloudEnv,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
