<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :extra-export-params="extraExportParams"
    :showSearchbox="showSearchbox"
    :defaultSearchKey="defaultSearchKey"
    :tableOverviewIndexs="tableOverviewIndexs"
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import ResStatusFilterMixin from '@/mixins/resStatusFilterMixin'
import { getNameFilter, getDescriptionFilter, getStatusFilter, getEnabledFilter, getBrandFilter, getProjectDomainFilter, getAccountFilter, getOsArchFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'
import { typeClouds, getDisabledProvidersActionMeta } from '@/utils/common/hypervisor'
import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import { HYPERVISORS_MAP, EXTRA_HYPERVISORS } from '@/constants'
import regexp from '@/utils/regexp'
import { getSignature } from '@/utils/crypto'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'HostList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResStatusFilterMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    frontGroupActions: {
      type: Function,
    },
    frontSingleActions: {
      type: Function,
    },
    hiddenFilterOptions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    const filter = {}
    if (this.$route.query.hasOwnProperty('enabled')) {
      filter.enabled = [this.$route.query.enabled]
    }
    const brandFilter = getBrandFilter()
    const notSupportBrand = [
      ...Object.values(HYPERVISORS_MAP).filter(item => item.cloud_env === 'public').map(item => item.brand),
      ...Object.values(EXTRA_HYPERVISORS).map(item => item.brand),
    ]
    const filterOptions = {
      id: {
        label: this.$t('table.title.id'),
      },
      name: getNameFilter(),
      description: getDescriptionFilter(),
      status: getStatusFilter('host'),
      enabled: getEnabledFilter(),
      host_status: {
        label: this.$t('compute.text_502'),
        dropdown: true,
        items: Object.keys(this.$t('status.host_status')).map(key => {
          return { label: this.$t('status.host_status')[key], key }
        }),
      },
      sn: {
        label: 'SN',
        distinctField: {
          type: 'extra_field',
          key: 'sn',
        },
      },
      any_mac: {
        label: 'MAC',
      },
      any_ip: {
        label: 'IP',
      },
      access_ip: {
        label: this.$t('compute.host_access_ip'),
        filter: true,
        formatter: val => {
          return `access_ip.contains("${val}")`
        },
      },
      region: {
        label: this.$t('compute.text_177'),
      },
      zone: {
        label: this.$t('compute.text_270'),
      },
      brand: {
        ...brandFilter,
        items: brandFilter.items.filter(val => !notSupportBrand.includes(val.key)),
      },
      project_domains: getProjectDomainFilter(),
      account: getAccountFilter(),
      cpu_architecture: getOsArchFilter(true),
      created_at: getCreatedAtFilter(),
    }
    this.hiddenFilterOptions.forEach(key => {
      delete filterOptions[key]
    })
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'hosts',
        getParams: this.getParam,
        filterOptions,
        filter,
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'id', 'server_id', 'sn', 'manufacture', 'model', 'schedtag', 'nonsystem_guests', 'public_scope', 'project_domain', 'region', 'os_arch', 'created_at'],
        fetchDataCb: (res) => {
          const { totals = {} } = res.data
          this.$emit('resStatisticsChange', totals)
        },
      }),
    }
  },
  computed: {
    groupActions () {
      const _frontGroupActions = this.frontGroupActions ? this.frontGroupActions.bind(this)() || [] : []
      const ownerDomain = this.$store.getters.isAdminMode || this.list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
      return _frontGroupActions.concat(
        [
          ...getEnabledSwitchActions(this, undefined, ['hosts_perform_enable', 'hosts_perform_disable'], {
            actions: [
              async (obj) => {
                const ids = this.list.selectedItems.map(item => item.id)
                await this.onManager('batchPerformAction', {
                  id: ids,
                  managerArgs: {
                    action: 'enable',
                  },
                })
                this.$store.dispatch('auth/getCapabilities')
              },
              async (obj) => {
                const ids = this.list.selectedItems.map(item => item.id)
                await this.onManager('batchPerformAction', {
                  id: ids,
                  managerArgs: {
                    action: 'disable',
                  },
                })
                this.$store.dispatch('auth/getCapabilities')
              },
            ],
            metas: [
              () => {
                const isDisable = !!this.list.selectedItems.find(item => !item.enabled)
                return {
                  validate: this.list.selectedItems.length && ownerDomain && isDisable,
                }
              },
              () => {
                const isEnable = !!this.list.selectedItems.find(item => item.enabled)
                return {
                  validate: this.list.selectedItems.length && ownerDomain && isEnable,
                }
              },
            ],
            extraMetas: [
              (obj) => {
                return getDisabledProvidersActionMeta({
                  rows: this.list.selectedItems,
                  disabledProviders: ['BingoCloud'],
                })
              },
              (obj) => {
                return getDisabledProvidersActionMeta({
                  rows: this.list.selectedItems,
                  disabledProviders: ['BingoCloud'],
                })
              },
            ],
          }),
          {
            label: this.$t('common.batchAction'),
            actions: () => {
              return [
                getDomainChangeOwnerAction(this, {
                  name: this.$t('dictionary.host'),
                  resource: 'hosts',
                }, {
                  permission: 'hosts_perform_change_owner',
                  meta: function () {
                    return {
                      validate: ownerDomain,
                    }
                  },
                  extraMeta: obj => {
                    return getDisabledProvidersActionMeta({
                      rows: this.list.selectedItems,
                      disabledProviders: ['BingoCloud'],
                    })
                  },
                }),
                getSetPublicAction(this, {
                  name: this.$t('dictionary.host'),
                  scope: 'domain',
                  resource: 'hosts',
                }, {
                  permission: 'hosts_perform_public',
                  extraMeta: obj => {
                    return getDisabledProvidersActionMeta({
                      rows: this.list.selectedItems,
                      disabledProviders: ['BingoCloud'],
                    })
                  },
                }),
                {
                  label: this.$t('compute.text_540'),
                  permission: 'hosts_perform_set_schedtag',
                  action: (obj) => {
                    this.createDialog('HostsAdjustLabelDialog', {
                      data: this.list.selectedItems,
                      columns: this.columns,
                      name: this.$t('dictionary.host'),
                      onManager: this.onManager,
                    })
                  },
                  meta: () => ({
                    validate: this.list.selectedItems.length && ownerDomain,
                  }),
                  extraMeta: obj => {
                    return getDisabledProvidersActionMeta({
                      rows: this.list.selectedItems,
                      disabledProviders: ['BingoCloud'],
                    })
                  },
                },
                {
                  label: this.$t('compute.text_508'),
                  permission: 'hosts_perform_undo_convert',
                  action: (obj) => {
                    // this.list.batchPerformAction('disable', null)
                    this.createDialog('HostUnconvertDialog', {
                      data: this.list.selectedItems,
                      columns: this.columns,
                      onManager: this.onManager,
                      name: this.$t('dictionary.host'),
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    if (!this.list.selectedItems.length) {
                      return {
                        validate: false,
                        tooltip: this.$t('compute.text_509'),
                      }
                    }
                    for (let i = 0; i < this.list.selectedItems.length; i++) {
                      const obj = this.list.selectedItems[i]
                      if (obj.host_type !== 'hypervisor') {
                        return {
                          validate: false,
                          tooltip: this.$t('compute.text_510'),
                        }
                      } else if (obj.nonsystem_guests > 0) {
                        return {
                          validate: false,
                          tooltip: this.$t('compute.text_511'),
                        }
                      } else if (obj.enabled) {
                        return {
                          validate: false,
                          tooltip: this.$t('compute.text_512'),
                        }
                      } else if (!obj.is_baremetal) {
                        return {
                          validate: false,
                          tooltip: '',
                        }
                      } else if (!ownerDomain) {
                        return {
                          validate: false,
                          tooltip: '',
                        }
                      }
                    }
                    return {
                      validate: true,
                      tooltip: '',
                    }
                  },
                  extraMeta: obj => {
                    return getDisabledProvidersActionMeta({
                      rows: this.list.selectedItems,
                      disabledProviders: ['BingoCloud'],
                    })
                  },
                },
                {
                  label: this.$t('compute.text_513'),
                  permission: 'hosts_update,hosts_perform_set_commit_bound',
                  action: () => {
                    this.createDialog('HostAdjustOversoldRatioDialog', {
                      data: this.list.selectedItems,
                      columns: this.columns,
                      onManager: this.onManager,
                      name: this.$t('dictionary.host'),
                      refresh: this.refresh,
                    })
                  },
                  meta: () => ({
                    validate: this.list.selectedItems.every(item => { return item.brand.toLowerCase() !== 'zstack' }) && ownerDomain,
                  }),
                  extraMeta: obj => {
                    return getDisabledProvidersActionMeta({
                      rows: this.list.selectedItems,
                      disabledProviders: ['BingoCloud'],
                    })
                  },
                },
                {
                  label: this.$t('compute.host.cpu.revert.resource'),
                  action: obj => {
                    this.createDialog('SetHostCpuReserveResourceDialog', {
                      onManager: this.onManager,
                      data: this.list.selectedItems,
                      columns: this.columns,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (!ownerDomain) {
                      ret.tooltip = this.$t('compute.host.cpu.revert.share')
                      return ret
                    }
                    const isAllOneCloud = this.list.selectedItems.every((item) => { return item.provider === typeClouds.providerMap.OneCloud.key })
                    if (!isAllOneCloud) {
                      ret.tooltip = this.$t('compute.text_515')
                      return ret
                    }
                    const isSomeRunning = this.list.selectedItems.some(item => item.running_guests > 0)
                    if (isSomeRunning) {
                      ret.tooltip = this.$t('compute.host.cpu.revert.running_guest_tooltip')
                      return ret
                    }
                    return {
                      validate: true,
                    }
                  },
                },
                {
                  label: this.$t('compute.setup_passthrough_reserve'),
                  permission: 'hosts_perform_set_reserved_resource_for_isolated_device',
                  action: () => {
                    this.createDialog('SetHostReserveResourceDialog', {
                      onManager: this.onManager,
                      data: this.list.selectedItems,
                      columns: this.columns,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    const isAllOneCloud = this.list.selectedItems.every((item) => { return item.provider === typeClouds.providerMap.OneCloud.key })
                    if (!isAllOneCloud) {
                      ret.tooltip = this.$t('compute.text_515')
                      return ret
                    }
                    const isAllReservedResource = this.list.selectedItems.every((item) => { return item.reserved_resource_for_gpu })
                    if (!isAllReservedResource) {
                      ret.tooltip = this.$t('compute.text_516')
                      return ret
                    }
                    return {
                      validate: ownerDomain,
                    }
                  },
                  extraMeta: obj => {
                    return getDisabledProvidersActionMeta({
                      rows: this.list.selectedItems,
                      disabledProviders: ['BingoCloud'],
                    })
                  },
                },
                {
                  label: this.$t('table.action.set_tag'),
                  permission: 'hosts_perform_set_user_metadata',
                  action: () => {
                    this.createDialog('SetTagDialog', {
                      data: this.list.selectedItems,
                      columns: this.columns,
                      onManager: this.onManager,
                      mode: 'add',
                      params: {
                        resources: 'host',
                      },
                      tipName: this.$t('dictionary.host'),
                    })
                  },
                  extraMeta: obj => {
                    return getDisabledProvidersActionMeta({
                      rows: this.list.selectedItems,
                      disabledProviders: ['BingoCloud'],
                    })
                  },
                },
                {
                  label: this.$t('compute.perform_delete'),
                  permission: 'hosts_delete',
                  action: () => {
                    this.createDialog('DeleteResDialog', {
                      vm: this,
                      data: this.list.selectedItems,
                      columns: this.columns,
                      title: this.$t('compute.perform_delete'),
                      name: this.$t('dictionary.host'),
                      onManager: this.onManager,
                      success: () => {
                        this.$store.dispatch('auth/getCapabilities')
                      },
                    })
                  },
                  meta: () => {
                    const deleteResult = this.$getDeleteResult(this.list.selectedItems)
                    if (!deleteResult.validate) {
                      return deleteResult
                    }
                    return {
                      validate: ownerDomain,
                    }
                  },
                  extraMeta: obj => {
                    return getDisabledProvidersActionMeta({
                      rows: this.list.selectedItems,
                      disabledProviders: ['BingoCloud'],
                    })
                  },
                },
              ]
            },
            meta: () => {
              return {
                validate: this.list.selected.length,
              }
            },
          },
        ],
      )
    },
    exportDataOptions () {
      return {
        title: this.$t('compute.text_111'),
        downloadType: 'local',
        items: [
          { field: 'id', title: 'ID' },
          { field: 'external_id', title: this.$t('table.title.external_id') },
          ...(this.columns.filter(item => !['server_id', 'id'].includes(item.field))),
          { label: this.$t('compute.text_523'), key: 'cpu_commit_rate' },
          { label: this.$t('compute.text_518'), key: 'mem_commit_rate' },
          { label: this.$t('compute.storage_commit_rate'), key: 'storage_commit_rate' },
        ],
        hiddenFields: ['cpu_commit', 'mem_commit', 'cpu_commit_rate', 'mem_commit_rate', 'storage_commit_rate', 'model', 'custom_ip', 'manufacture'],
        fixedItems: [
          { key: 'mem_size', label: this.$t('compute.text_564') + '(M)' },
          { key: 'storage_size', label: this.$t('compute.text_565') + '(M)' },
          { key: 'storage_virtual', label: this.$t('compute.text_565_1') + '(M)' },
          { key: 'sys_info.model', label: this.$t('compute.text_580') },
          { key: 'sys_info.oem_name', label: this.$t('compute.text_847') },
          { key: 'ipmi_ip', label: 'IPMI IP' },
          { key: 'public_ip', label: this.$t('compute.text_1374') },
          { key: 'access_ip', label: 'IP' },
        ],
      }
    },
  },
  watch: {
    filterParams: {
      handler: function (val) {
        if (!val.isFirstLoad) {
          const filterStatus = this.list.filter.status || []
          val.statusCheckArr.forEach((item) => {
            if (!filterStatus.includes(item)) {
              filterStatus.push(item)
            }
          })
          if (val.statusCheckArr && val.statusCheckArr.length > 0) {
            this.list.changeFilter({ ...this.list.filter, status: val.statusCheckArr })
            this.list.filterOptions.status.items = []
            const statusArrTem = this.list.filterOptions.status.items || []
            val.statusArr.forEach((item) => {
              const isExist = statusArrTem.some((obj) => { return obj.key === item })
              if (!isExist) {
                statusArrTem.push({
                  key: item,
                  label: this.$t(`status.host.${item}`),
                })
              }
            })
            this.list.filterOptions.status.items = statusArrTem
          } else {
            delete this.list.filter.status
            this.list.changeFilter({ ...this.list.filter })
          }
        }
      },
      deep: true,
    },
    'list.filter' (val) {
      this.$bus.$emit('ServerFilterChange', val)
    },
  },
  created () {
    this.initSidePageTab('host-detail')
    this.list.fetchData()
  },
  methods: {
    refresh () {
      this.list.fetchData()
    },
    extraExportParams ({ currentExportType }) {
      if (currentExportType === 'all') return { baremetal: false }
      return {}
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      ret.hide_cpu_topo_info = true
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'HostSidePage', {
        id: row.id,
        resource: 'hosts',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
    defaultSearchKey (search) {
      if (regexp.isIPv4(search)) {
        return 'any_ip'
      }
      if (regexp.isMAC(search)) {
        return 'any_mac'
      }
    },
    genQueryData (val, list) {
      const select = [
        {
          type: 'field',
          params: [val.seleteItem],
        },
        { // 对应 mean(val.seleteItem)
          type: 'max',
          params: [],
        },
      ]
      const tags = []
      list.map((item, index) => {
        if (item.access_ip) {
          const l = { key: 'host_ip', operator: '=', value: item.access_ip }
          if (index) {
            l.condition = 'OR'
          }
          tags.push(l)
        }
      })
      const data = {
        metric_query: [
          {
            model: {
              measurement: val.fromItem,
              database: 'telegraf',
              select: [select],
              group_by: [{ type: 'tag', params: ['host_ip'] }],
              tags,
            },
          },
        ],
        scope: this.$store.getters.scope,
        from: '1h',
        interval: '5m',
        soffset: 0,
      }
      data.signature = getSignature(data)
      return data
    },
  },
}
</script>
