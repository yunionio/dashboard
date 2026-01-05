<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    show-tag-config
    :columns="templateListColumns || columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showSingleActions="isTemplate ? false : showActions"
    :showGroupActions="showActions && showGroupActions"
    :export-data-options="exportDataOptions"
    :tag-config-params="tagConfigParams"
    :show-page="!isTemplate" />
</template>

<script>
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import { getNameFilter, getStatusFilter, getTenantFilter, getFilter, getDomainFilter, getBrandFilter, getCloudProviderFilter, getAccountFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import globalSearchMixins from '@/mixins/globalSearch'
import { HYPERVISORS_MAP } from '@/constants'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { ENGINE_ARCH } from '../constants/index.js'

export default {
  name: 'RedisList',
  mixins: [WindowsMixin, globalSearchMixins, ListMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
  props: {
    id: String,
    cloudEnv: String,
    getParams: {
      type: Object,
    },
    cloudEnvOptions: {
      type: Array,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'elasticcaches',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: Object.values(expectStatus.redis).flat(),
        filterOptions: {
          external_id: {
            label: this.$t('table.title.external_id'),
          },
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          status: getStatusFilter('redis'),
          brand: getBrandFilter('redis_engine_brands'),
          account: getAccountFilter(),
          manager: getCloudProviderFilter(),
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
            hiddenField: 'engine',
            distinctField: {
              type: 'field',
              key: 'engine_version',
            },
          },
          local_category: {
            label: this.$t('db.text_119'),
            hiddenField: 'instance_type',
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
            hiddenField: 'private_dns',
            title: this.$t('db.text_59'),
          }),
          region: {
            label: this.$t('db.text_40'),
          },
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'instance_type', 'created_at'],
        autoHiddenFilterKey: 'redis_hidden_columns',
      }),
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
              validate: !this.cloudEnvEmpty,
              tooltip: this.cloudEnvEmpty ? this.$t('common.no_platform_available') : '',
            }
          },
        },
        {
          label: this.$t('db.text_69'),
          permission: 'redis_elasticcaches_perform_sync',
          action: () => {
            this.onManager('batchPerformAction', {
              id: this.list.selectedItems.map(item => item.id),
              managerArgs: {
                action: 'Sync',
              },
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
        {
          label: this.$t('db.text_213'),
          actions: (obj) => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? this.$t('db.text_68') : ''
            const isRunning = this.list.selectedItems.every(item => item.status.toLowerCase() === 'running')
            const notRunninTip = !isRunning ? this.$t('db.text_156') : null
            return [
              {
                label: this.$t('db.text_239'),
                permission: 'redis_elasticcaches_perform_flush_instance',
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
                  const ret = {
                    validate: selectedLength,
                    tooltip: notSelectedTooltip,
                  }
                  // aws 和 azure禁用
                  let awsOrAzure = ''
                  this.list.selectedItems.map((item) => {
                    if (item.brand === HYPERVISORS_MAP.aws.brand || item.brand === HYPERVISORS_MAP.azure.brand) {
                      awsOrAzure = item.brand
                    }
                  })
                  if (awsOrAzure) {
                    ret.validate = false
                    ret.tooltip = this.$t('db.text_384', [awsOrAzure])
                  }
                  return ret
                },
              },
              {
                label: this.$t('table.action.set_tag'),
                permission: 'redis_elasticcaches_perform_set_user_metadata',
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
                label: this.$t('db.text_70'),
                permission: 'redis_elasticcaches_perform_restart',
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
                  const isNotQcloud = this.list.selectedItems.every(item => item.brand !== 'Qcloud')
                  const isQcloudTip = isNotQcloud ? null : this.$t('db.text_358')
                  const ret = {
                    validate: selectedLength && isRunning && isNotQcloud,
                    tooltip: notSelectedTooltip || notRunninTip || isQcloudTip,
                  }
                  // aws 和 azure禁用
                  let awsOrAzure = ''
                  this.list.selectedItems.map((item) => {
                    if (item.brand === HYPERVISORS_MAP.aws.brand || item.brand === HYPERVISORS_MAP.azure.brand) {
                      awsOrAzure = item.brand
                    }
                  })
                  if (awsOrAzure && ret.validate) {
                    ret.validate = false
                    ret.tooltip = this.$t('db.text_384', [awsOrAzure])
                  }
                  return ret
                },
              },
              {
                label: this.$t('db.text_71'),
                permission: 'redis_elasticcaches_perform_postpaid_expire',
                action: () => {
                  this.createDialog('SetDurationDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    alert: this.$t('db.text_393'),
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
                    return item.release_at
                  })
                  const isSomeNotExpired = this.list.selectedItems.some((item) => {
                    return !item.release_at
                  })
                  if (isSomeExpired && isSomeNotExpired) {
                    ret.tooltip = this.$t('db.text_73')
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
              },
              {
                label: this.$t('db.text_157'),
                permission: 'redis_elasticcaches_perform_renew',
                action: () => {
                  this.createDialog('RedisRenewDialog', {
                    title: this.$t('db.text_157'),
                    name: this.$t('dictionary.elasticcaches'),
                    alert: this.$t('network.text_765'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const isPrepaid = this.list.selectedItems.every(item => item.billing_type === 'prepaid')
                  const validate = (isRunning && isPrepaid)
                  return {
                    validate: validate,
                    tooltip: notRunninTip || (!isPrepaid ? this.$t('db.text_158') : null),
                  }
                },
              },
              {
                label: this.$t('db.text_351'),
                permission: 'redis_elasticcaches_perform_set_auto_renew',
                action: () => {
                  this.createDialog('AutoRenewDialog', {
                    name: this.$t('dictionary.elasticcaches'),
                    data: this.list.selectedItems,
                    alert: this.$t('network.text_766'),
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const isPrepaid = this.list.selectedItems.every(item => item.billing_type === 'prepaid')
                  const validate = (isRunning && isPrepaid)
                  return {
                    validate: validate,
                    tooltip: notRunninTip || (!isPrepaid ? this.$t('db.text_158') : null),
                  }
                },
              },
              disableDeleteAction(Object.assign(this, { permission: 'redis_elasticcaches_update' }), {
                name: this.$t('dictionary.elasticcaches'),
              }),
              {
                label: this.$t('db.text_42'),
                permission: 'redis_elasticcaches_delete',
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
      tagConfigParams: {
        resource: 'elasticcaches',
        queryTreeId: 'project-tag-value-tree',
      },
    }
  },
  computed: {
    showActions () {
      return !this.$isScopedPolicyMenuHidden('redis_hidden_columns.perform_action')
    },
    exportDataOptions () {
      const ret = {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('dictionary.external_id'), key: 'external_id' },
          ...this.columns,
        ],
        title: this.$t('dictionary.elasticcache'),
        downloadType: 'local',
        fixedItems: [
          { key: 'capacity_mb', label: this.$t('db.text_109') + '(M)' },
        ],
        hiddenFields: ['instance_type'],
      }
      ret.items.push({
        field: 'expired_at',
        title: this.$t('scope.text_791'),
        formatter: ({ row }) => {
          if (!row.expired_at) return '-'
          return this.$moment(row.expired_at).format()
        },
      })
      return ret
    },
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('redis-detail')
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
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
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'RedisSidePage', {
        id: row.id,
        resource: 'elasticcaches',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.redis).flat(),
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
<style lang="less">
.td-ellipsis {
  width: 150px;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
