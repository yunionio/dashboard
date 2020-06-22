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
import { getNameFilter, getStatusFilter, getTenantFilter, getFilter } from '@/utils/common/tableFilter'
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
          projects: getTenantFilter(),
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
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '实例类型', key: 'arch_type' },
          { label: '配置', key: 'instance_type' },
          { label: '类型版本', key: 'engine' },
          { label: '内网链接地址', key: 'private_dns' },
          { label: '内网链接地址端口', key: 'private_connect_port' },
          { label: '外网链接地址', key: 'public_dns' },
          { label: '外网链接地址端口', key: 'public_connect_port' },
          { label: '云账号', key: 'account' },
          { label: '计费方式', key: 'billing_type' },
          { label: '状态', key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'provider' },
          { label: '区域', key: 'region' },
        ],
      },
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
                label: '重启',
                action: () => {
                  this.createDialog('RedisRestartdialog', {
                    title: '重启',
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
                label: '到期释放',
                action: () => {
                  this.createDialog('SetDurationDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
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
                    ret.tooltip = '包年包月机器，不支持此操作'
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
                    ret.tooltip = '暂只支持同时操作已设置到期释放'
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
                label: '删除',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: '删除',
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.elasticcaches'),
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
                      const obj = this.list.selectedItems[i]
                      if (obj.disable_delete) {
                        tooltip = '删除保护，如需解除，请点击【设置删除保护】'
                        validate = false
                        break
                      }
                      const seconds = this.$moment(obj.expired_at).diff(new Date()) / 1000
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
<style lang="scss">
 .td-ellipsis{
    width: 150px;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
 }
</style>
