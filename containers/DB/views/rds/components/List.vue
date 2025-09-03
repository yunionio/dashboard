<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    show-tag-config
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showSingleActions="showActions"
    :showGroupActions="showActions && showGroupActions"
    :defaultSearchKey="defaultSearchKey"
    :export-data-options="exportDataOptions"
    :tag-config-params="tagConfigParams" />
</template>
<script>

import ListMixin from '@/mixins/list'
import { getNameFilter, getFilter, getTenantFilter, getDomainFilter, getStatusFilter, getBrandFilter, getCloudProviderFilter, getAccountFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import globalSearchMixins from '@/mixins/globalSearch'
import { HYPERVISORS_MAP } from '@/constants'
import regexp from '@/utils/regexp'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'RDSList',
  mixins: [WindowsMixin, ListMixin, globalSearchMixins, ColumnsMixin, SingleActionsMixin],
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
        resource: 'dbinstances',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.rds).flat(),
        filterOptions: {
          external_id: {
            label: this.$t('table.title.external_id'),
          },
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          status: getStatusFilter('rds'),
          brand: getBrandFilter('rds_brands'),
          account: getAccountFilter(),
          manager: getCloudProviderFilter(),
          projects: getTenantFilter(),
          billing_type: getFilter({
            field: 'billing_type',
            title: this.$t('db.text_54'),
            items: [
              { label: this.$t('db.text_55'), key: 'postpaid' },
              { label: this.$t('db.text_56'), key: 'prepaid' },
            ],
          }),
          engine: getFilter({
            field: 'engine',
            title: this.$t('db.text_57'),
            items: [
              { label: 'MySQL', key: 'MySQL' },
              { label: 'PostgreSQL', key: 'PostgreSQL' },
              { label: 'SQLServer', key: 'SQLServer' },
            ],
          }),
          internal_connection_str: getFilter({
            field: 'internal_connection_str',
            title: this.$t('db.text_58'),
          }),
          connection_str: getFilter({
            hiddenField: 'internal_connection_str',
            field: 'connection_str',
            title: this.$t('db.text_59'),
          }),
          ip_addr: { hiddenField: 'internal_connection_str', label: this.$t('db.url_ip') },
          region: {
            label: this.$t('db.text_40'),
          },
          project_domains: getDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'vcpu_count', 'account', 'created_at'],
        autoHiddenFilterKey: 'rds_hidden_columns',
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'rds_dbinstances_create',
          action: () => {
            this.$router.push('/rds/create')
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
          permission: 'rds_dbinstances_perform_syncstatus',
          action: () => {
            this.onManager('batchPerformAction', {
              id: this.list.selectedItems.map(item => item.id),
              managerArgs: {
                action: 'sync-status',
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
          label: this.$t('common.batchAction'),
          actions: (obj) => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? this.$t('db.text_68') : ''
            const isRunning = this.list.selectedItems.every(item => item.status.toLowerCase() === 'running')
            const notRunninTip = !isRunning ? this.$t('db.text_156') : null
            return [
              {
                label: this.$t('db.text_70'),
                permission: 'rds_dbinstances_perform_reboot',
                action: () => {
                  this.createDialog('RDSRestartdialog', {
                    title: this.$t('db.text_70'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
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
                label: this.$t('db.text_71'),
                permission: 'rds_dbinstances_perform_postpaid_expire',
                action: () => {
                  this.createDialog('SetDurationDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    alert: this.$t('db.text_391'),
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.dbinstances'),
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
                label: this.$t('table.action.set_tag'),
                permission: 'rds_dbinstances_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'dbinstance',
                    },
                    tipName: this.$t('dictionary.dbinstance'),
                  })
                },
              },
              {
                label: this.$t('db.text_157'),
                permission: 'rds_dbinstances_perform_renew',
                action: () => {
                  this.createDialog('RedisRenewDialog', {
                    title: this.$t('db.text_157'),
                    name: this.$t('dictionary.dbinstances'),
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
                permission: 'rds_dbinstances_perform_set_auto_renew',
                action: () => {
                  this.createDialog('AutoRenewDialog', {
                    name: this.$t('dictionary.dbinstances'),
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
              disableDeleteAction(Object.assign(this, { permission: 'rds_dbinstances_update' }), {
                name: this.$t('dictionary.dbinstances'),
              }),
              {
                label: this.$t('db.text_42'),
                permission: 'rds_dbinstances_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: this.$t('db.text_42'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.dbinstances'),
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
        resource: 'dbinstances',
        queryTreeId: 'project-tag-value-tree',
      },
    }
  },
  computed: {
    showActions () {
      return !this.$isScopedPolicyMenuHidden('rds_hidden_columns.perform_action')
    },
    exportDataOptions () {
      const ret = {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('dictionary.external_id'), key: 'external_id' },
          ...this.columns,
        ],
        title: this.$t('dictionary.dbinstance'),
        downloadType: 'local',
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
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')
    this.list.fetchData()
    this.initSidePageTab('detail')
    this.$bus.$on('RdsRefresh', () => {
      this.refresh()
    })
  },
  beforeDestroy () {
    this.$bus.$off('RdsRefresh')
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'RDSSidePage', {
        id: row.id,
        resource: 'dbinstances',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.rds).flat(),
      }, {
        list: this.list,
        tab,
      })
    },
    refresh () {
      this.list.refresh()
    },
    defaultSearchKey (search) {
      if (regexp.isIPv4(search)) {
        return 'ip_addr'
      }
      return 'name'
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
