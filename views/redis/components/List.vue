<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { ENGINE_ARCH } from '../constants/index.js'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getNameFilter, getStatusFilter, getTenantFilter, getFilter, getDomainFilter, getBrandFilter } from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import globalSearchMixins from '@/mixins/globalSearch'

export default {
  name: 'RedisList',
  mixins: [WindowsMixin, globalSearchMixins, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'elasticcaches',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.redis).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('redis'),
          brand: getBrandFilter('redis_engine_brands'),
          // account: getAccountFilter(),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          billing_type: getFilter({
            field: 'billing_type',
            title: this.$t('db.text_54'),
            items: [
              { label: this.$t('db.text_55'), key: 'postpaid' },
              { label: this.$t('db.text_56'), key: 'prepaid' },
            ],
          }),
          engine_version: {
            label: this.$t('db.text_236'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'engine_version',
            },
          },
          local_category: {
            label: this.$t('db.text_119'),
            dropdown: true,
            multiple: true,
            items: Object.keys(ENGINE_ARCH).map(key => {
              return { label: ENGINE_ARCH[key], key }
            }),
          },
          private_dns: getFilter({
            field: 'private_dns',
            title: this.$t('db.text_58'),
          }),
          public_dns: getFilter({
            field: 'public_dns',
            title: this.$t('db.text_59'),
          }),
          region: {
            label: this.$t('db.text_40'),
          },
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'instance_type', 'account'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('db.text_60'), key: 'name' },
          { label: this.$t('db.text_119'), key: 'arch_type' },
          { label: this.$t('db.text_109'), key: 'instance_type' },
          { label: this.$t('db.text_112'), key: 'engine' },
          { label: this.$t('db.text_65'), key: 'private_dns' },
          { label: this.$t('db.text_237'), key: 'private_connect_port' },
          { label: this.$t('db.text_66'), key: 'public_dns' },
          { label: this.$t('db.text_238'), key: 'public_connect_port' },
          { label: this.$t('db.text_67'), key: 'account' },
          { label: this.$t('db.text_54'), key: 'billing_type' },
          { label: this.$t('db.text_46'), key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('db.text_51'), key: 'provider' },
          { label: this.$t('db.text_40'), key: 'region' },
        ],
      },
      groupActions: [
        {
          label: this.$t('db.text_41'),
          permission: 'redis_elasticcaches_create',
          action: () => {
            this.createServer()
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('db.text_213'),
          actions: (obj) => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? this.$t('db.text_68') : ''
            return [
              {
                label: this.$t('db.text_69'),
                action: (obj) => {
                  this.onManager('batchPerformAction', {
                    id: this.list.selectedItems.map(item => item.id),
                    managerArgs: {
                      action: 'Sync',
                    },
                  })
                },
                meta: () => {
                  return {
                    validate: selectedLength,
                    tooltip: notSelectedTooltip,
                  }
                },
              },
              {
                label: this.$t('db.text_239'),
                action: () => {
                  this.createDialog('RedisClearDataDialog', {
                    title: this.$t('db.text_239'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.elasticcaches'),
                  })
                },
                meta: () => {
                  return {
                    validate: selectedLength,
                    tooltip: notSelectedTooltip,
                  }
                },
              },
              {
                label: this.$t('db.text_70'),
                action: () => {
                  this.createDialog('RedisRestartdialog', {
                    title: this.$t('db.text_70'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.elasticcaches'),
                  })
                },
                meta: () => {
                  return {
                    validate: selectedLength,
                    tooltip: notSelectedTooltip,
                  }
                },
              },
              {
                label: this.$t('db.text_71'),
                action: () => {
                  this.createDialog('SetDurationDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.elasticcaches'),
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  // 包年包月机器，不支持此操作
                  const isSomePrepaid = this.list.selectedItems.some((item) => {
                    return item.billing_type === 'prepaid'
                  })
                  if (isSomePrepaid) {
                    ret.tooltip = this.$t('db.text_72')
                    return ret
                  }
                  // 暂只支持同时操作已设置到期或未设置到期释放的机器
                  const isSomeExpired = this.list.selectedItems.some((item) => {
                    return item.expired_at
                  })
                  const isSomeNotExpired = this.list.selectedItems.some((item) => {
                    return !item.expired_at
                  })
                  if (isSomeExpired && isSomeNotExpired) {
                    ret.tooltip = this.$t('db.text_73')
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
              },
              disableDeleteAction(this, {
                name: this.$t('dictionary.elasticcaches'),
              }),
              {
                label: this.$t('table.action.set_tag'),
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'elasticcache',
                    },
                    tipName: this.$t('dictionary.elasticcache'),
                  })
                },
              },
              {
                label: this.$t('db.text_42'),
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: this.$t('db.text_42'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.elasticcaches'),
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: () => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? this.$t('db.text_68') : ''
            return {
              validate: selectedLength,
              tooltip: notSelectedTooltip,
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('redis-detail')
  },
  methods: {
    createServer () {
      this.$router.push('/redis/create')
    },
    getSeachStatus () {
      const selectedStatus = ['running', 'unknown', 'sync_failed']
      const status = []
      for (const key in this.$t('status.redis')) {
        if (selectedStatus.indexOf(key) > -1) {
          status.push({
            key,
            label: this.$t('status.redis')[key],
          })
        }
      }
      return status
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'RedisSidePage', {
        id: row.id,
        resource: 'elasticcaches',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.redis).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
<style lang="less">
 .td-ellipsis{
    width: 150px;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
 }
</style>
