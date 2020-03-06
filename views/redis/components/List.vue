<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import { ENGINE_ARCH } from '../constants/index.js'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getNameFilter, getStatusFilter, getTenantFilter, getFilter } from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import globalSearchMixins from '@/mixins/globalSearch'

export default {
  name: 'RedisList',
  mixins: [WindowsMixin, globalSearchMixins, ListMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'elasticcaches',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.redis).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('redis'),
          brand: {
            label: '平台',
            dropdown: true,
            multiple: true,
            items: [
              { label: '阿里云', key: 'Aliyun' },
              { label: '华为云', key: 'Huawei' },
            ],
          },
          // account: getAccountFilter(),
          tenant: getTenantFilter(),
          billing_type: getFilter({
            field: 'billing_type',
            title: '计费方式',
            items: [
              { label: '按量付费', key: 'postpaid' },
              { label: '包年包月', key: 'prepaid' },
            ],
          }),
          engine_version: {
            label: '版本',
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'engine_version',
            },
          },
          arch_type: {
            label: '实例类型',
            dropdown: true,
            multiple: true,
            items: Object.keys(ENGINE_ARCH).map(key => {
              return { label: ENGINE_ARCH[key], key }
            }),
          },
          private_dns: getFilter({
            field: 'private_dns',
            title: '链接地址-内网',
          }),
          public_dns: getFilter({
            field: 'public_dns',
            title: '链接地址-外网',
          }),
          region: {
            label: '区域',
          },
        },
        responseData: this.responseData,
      }),
      groupActions: [
        {
          label: '新建',
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
          label: '删除',
          action: () => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            let validate = true
            let tooltip = ''
            if (this.list.selectedItems.length === 0) {
              validate = false
              tooltip = '请选择需要操作的实例'
            }
            if (this.list.selectedItems.length > 0) {
              for (let i = 0; i < this.list.selectedItems.length; i++) {
                let obj = this.list.selectedItems[i]
                if (obj['disable_delete']) {
                  tooltip = '删除保护，如需解除，请点击【设置删除保护】'
                  validate = false
                  break
                }
                let seconds = this.$moment(obj.expired_at).diff(new Date()) / 1000
                if (obj.billing_type === 'prepaid' && seconds > 0) {
                  tooltip = '实例未到期不允许删除'
                  validate = false
                  break
                }
              }
            }
            return {
              validate,
              tooltip,
            }
          },
        },
        {
          label: '批量操作',
          actions: (obj) => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? '请选择需要操作的实例' : ''
            return [
              {
                label: '同步状态',
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
                label: '清空数据',
                action: () => {
                  this.createDialog('RedisClearDataDialog', {
                    title: '清空数据',
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
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
                label: '重启',
                action: () => {
                  this.createDialog('RedisRestartdialog', {
                    title: '重启',
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  return {
                    validate: selectedLength,
                    tooltip: notSelectedTooltip,
                  }
                },
              },
              disableDeleteAction(this),
            ]
          },
          meta: () => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? '请选择需要操作的实例' : ''
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
      for (let key in this.$t('status.redis')) {
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
<style lang="scss">
 .td-ellipsis{
    width: 150px;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
 }
</style>
