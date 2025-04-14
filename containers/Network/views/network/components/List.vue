<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :singleActions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :defaultSearchKey="defaultSearchKey"
    :showSingleActions="showActions"
    :showGroupActions="showActions && showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows.js'
import { getNameFilter, getDescriptionFilter, getVpcFilter, getBrandFilter, getAccountFilter, getTenantFilter, getDomainFilter, getRegionFilter, getStatusFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import ListMixin from '@/mixins/list'
import GlobalSearchMixin from '@/mixins/globalSearch'
import expectStatus from '@/constants/expectStatus'
import { getSetPublicAction } from '@/utils/common/tableActions'
import regexp from '@/utils/regexp'
import ResStatusFilterMixin from '@/mixins/resStatusFilterMixin'
import { getDisabledProvidersActionMeta } from '@/utils/common/hypervisor'
import { PROVIDER_MAP } from '@/constants'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'NetworkList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResStatusFilterMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
    cloudEnvOptions: {
      type: Array,
    },
    showGroupActions: {
      type: Boolean,
      default: true,
    },
    showSearchbox: {
      type: Boolean,
      default: true,
    },
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
    hiddenColumns: {
      type: Array,
      default: () => ([]),
    },
    hiddenFilterOptions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    const brandFilter = getBrandFilter('network_manage_brands')
    if (!R.find(R.propEq('key', 'OneCloud'))(brandFilter.items)) {
      brandFilter.items.push({ key: 'OneCloud', label: 'OneCloud' })
    }
    const filterOptions = {
      id: {
        label: this.$t('table.title.id'),
      },
      name: getNameFilter(),
      description: getDescriptionFilter(),
      ip_match: {
        label: 'IP',
        hiddenField: 'ip',
      },
      guest_ip_start: {
        label: this.$t('network.text_607'),
        hiddenField: 'ip',
        filter: true,
        formatter: val => {
          return `guest_ip_start.contains('${val}')`
        },
      },
      guest_ip_end: {
        label: this.$t('network.text_608'),
        hiddenField: 'ip',
        filter: true,
        formatter: val => {
          return `guest_ip_end.contains('${val}')`
        },
      },
      guest_ip6_start: {
        label: this.$t('network.guest_ip6_start'),
        hiddenField: 'ip',
        filter: true,
        formatter: val => {
          return `guest_ip6_start.contains('${val}')`
        },
      },
      guest_ip6_end: {
        label: this.$t('network.guest_ip6_end'),
        hiddenField: 'ip',
        filter: true,
        formatter: val => {
          return `guest_ip6_end.contains('${val}')`
        },
      },
      status: getStatusFilter('network'),
      is_auto_alloc: {
        label: this.$t('common_498'),
        dropdown: true,
        items: Object.keys(this.$t('status.networIsAutoAlloc')).map(k => {
          return { label: this.$t('status.networIsAutoAlloc')[k], key: k }
        }),
      },
      server_type: {
        label: this.$t('network.text_249'),
        dropdown: true,
        multiple: true,
        items: [
          { label: this.$t('network.text_598'), key: 'baremetal' },
          { label: this.$t('network.text_599'), key: 'container' },
          { label: this.$t('network.text_226'), key: 'guest' },
          { label: 'PXE', key: 'pxe' },
          { label: 'IPMI', key: 'ipmi' },
          { label: this.$t('network.text_221'), key: 'eip' },
        ],
      },
      brand: brandFilter,
      cloudaccount: getAccountFilter(),
      projects: getTenantFilter(),
      project_domains: getDomainFilter(),
      region: getRegionFilter(),
      vpc: getVpcFilter(),
      wire: {
        label: this.$t('network.text_571'),
      },
      vlan_id: {
        label: 'VLAN',
        dropdown: true,
        distinctField: {
          type: 'field',
          key: 'vlan_id',
        },
      },
      created_at: getCreatedAtFilter(),
    }
    this.hiddenFilterOptions.forEach(key => {
      delete filterOptions[key]
    })
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'networks',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.network).flat(),
        filterOptions,
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'vpc', 'wire', 'vlan_id', 'schedtag', 'account', 'public_scope', 'created_at'],
        autoHiddenFilterKey: 'network_hidden_columns',
        fetchDataCb: (res) => {
          const { totals = {} } = res.data
          this.$emit('resStatisticsChange', totals)
        },
      }),
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'networks_create',
          action: () => {
            this.$router.push({
              name: 'NetworkCreate',
              query: {
                type: this.cloudEnv,
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: !this.cloudEnvEmpty,
              tooltip: this.cloudEnvEmpty ? this.$t('common.no_platform_available') : '',
            }
          },
          hidden: () => this.hiddenActions.includes('create'),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              {
                label: this.$t('network.text_606'),
                permission: 'networks_update',
                action: () => {
                  this.$router.push({ path: '/network/batch-edit', query: { id: this.list.selectedItems.map((item) => { return item.id }) } })
                },
                meta: (row) => {
                  const ret = { validate: true, tooltip: '' }
                  const isAllOneCloud = this.list.selectedItems.every(item => item.brand === 'OneCloud')
                  if (!isAllOneCloud) {
                    ret.validate = false
                    ret.tooltip = this.$t('network.text_737')
                    return ret
                  }
                  const isAllDefault = this.list.selectedItems.every(item => item.vpc_id === 'default')
                  if (!isAllDefault) {
                    ret.validate = false
                    ret.tooltip = this.$t('network.text_650')
                    return ret
                  }
                  if (!this.$isOwner(this.list.selectedItems).validate) {
                    ret.validate = false
                    ret.tooltip = this.$t('network.text_627')
                    return ret
                  }
                  return ret
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    rows: this.list.selectedItems,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              },
              {
                label: this.$t('network.text_225', [this.$t('dictionary.project')]),
                permission: 'networks_perform_change_owner',
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    name: this.$t('dictionary.network'),
                    onManager: this.onManager,
                    resource: 'networks',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: '',
                  }
                  if (this.isProjectMode) {
                    ret.tooltip = this.$t('monitor.text_9', [this.$t('dictionary.domain')])
                    return ret
                  }
                  const f = this.eachValidates((obj) => {
                    return this.isPower(obj)
                  })
                  return {
                    validate: f,
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    rows: this.list.selectedItems,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              },
              getSetPublicAction(this, {
                name: this.$t('dictionary.network'),
                scope: 'project',
                resource: 'networks',
              }, {
                permission: 'networks_perform_public',
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    rows: this.list.selectedItems,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              }),
              // {
              //   label: '设置共享',
              //   permission: 'networks_perform_public',
              //   action: () => {
              //     this.createDialog('SetPublicDialog', {
              //       data: this.list.selectedItems,
              //       columns: this.columns,
              //       onManager: this.onManager,
              //     })
              //   },
              //   meta: () => {
              //     const f = this.eachValidates((obj) => {
              //       return this.isPower(obj)
              //     })
              //     return {
              //       validate: f,
              //     }
              //   },
              // },
              // {
              //   label: '分割IP子网',
              //   permission: 'networks_perform_split',
              //   action: () => {
              //     this.createDialog('NetworkSplitDialog', {
              //       data: this.list.selectedItems,
              //       columns: this.columns,
              //       list: this.list,
              //     })
              //   },
              //   meta: () => {
              //     const f = this.eachValidates((obj) => {
              //       if (this.isPower(obj)) {
              //         if (obj.external_id && obj.external_id.length > 0) { // 是公网 IP
              //           return false
              //         } else {
              //           return true
              //         }
              //       }
              //     })
              //     return {
              //       validate: f,
              //       tooltip: '公网IP不支持该操作',
              //     }
              //   },
              // },
              {
                label: this.$t('network.text_623'),
                permission: 'networks_perform_merge',
                action: () => {
                  this.createDialog('NetworkConcatDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    itemData: {
                      IPfrom: this.IPfromObj.IPfrom,
                      nameFrom: this.IPfromObj.name,
                      IPto: this.IPtoObj.IPto,
                      nameTo: this.IPtoObj.name,
                    },
                  })
                },
                meta: () => {
                  let tooltip = ''
                  if (this.list.selectedItems.length === 2) {
                    if (this.list.selectedItems.every(v => v.external_id && v.external_id.length > 0)) { // 是公网 IP
                      tooltip = this.$t('network.text_624')
                    } else {
                      if (!this.link(this.list.selectedItems)) {
                        tooltip = this.$t('network.text_625')
                      }
                    }
                  } else {
                    tooltip = this.$t('network.text_626')
                  }
                  return {
                    validate: this.allowConcat,
                    tooltip,
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
                label: this.$t('common_564'),
                permission: 'networks_update',
                action: () => {
                  this.createDialog('NetworkUpdateIsAutoAllocDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('common_564'),
                    name: this.$t('dictionary.network'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  if (this.list.selectedItems.some(item => !this.isPower(item))) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_627'),
                    }
                  }
                  if (this.list.selectedItems.some(obj => obj.server_type !== 'guest')) {
                    return {
                      validate: false,
                      tooltip: this.$t('common_565'),
                    }
                  }
                  return {
                    validate: true,
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
                label: this.$t('network.switch_wire'),
                permission: 'networks_perform_switch_wire',
                action: () => {
                  this.createDialog('NetworkSwitchWireDialog', {
                    title: this.$t('network.switch_wire'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const isOneCloud = this.list.selectedItems.every(item => item.brand === 'OneCloud')
                  const provider = 'OneCloud'
                  if (!isOneCloud) {
                    return {
                      validate: false,
                      tooltip: !isOneCloud && this.$t('common.brand_support', [PROVIDER_MAP[provider].label]),
                    }
                  }
                  return {
                    validate: this.list.selectedItems.every(item => item.can_delete),
                  }
                },
              },
              {
                label: this.$t('network.text_201'),
                permission: 'networks_perform_syncstatus',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
                meta: () => {
                  if (this.list.selectedItems.some(item => !this.isPower(item))) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_627'),
                    }
                  }
                  if (this.list.selectedItems.some(v => v.brand.toLowerCase() === 'onecloud')) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_628'),
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: this.$t('table.action.set_tag'),
                permission: 'networks_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'network',
                    },
                    tipName: this.$t('dictionary.network'),
                  })
                },
                meta: () => {
                  if (this.list.selectedItems.some(item => !this.isPower(item))) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_627'),
                    }
                  }
                  return {
                    validate: true,
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
                label: this.$t('network.text_131'),
                permission: 'networks_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('network.text_131'),
                    name: this.$t('dictionary.network'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  if (this.list.selectedItems.some(item => !this.isPower(item))) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_627'),
                    }
                  }
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    rows: this.list.selectedItems,
                    disabledProviders: ['BingoCloud', 'SangFor'],
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
      IPfromObj: { IPfrom: '', name: '' },
      IPtoObj: { IPto: '', name: '' },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
    allowConcat () {
      if (this.list.selectedItems.length === 2) {
        if (this.list.selectedItems.every(v => v.external_id && v.external_id.length > 0)) { // 是公网 IP
          return false
        }
        return this.link(this.list.selectedItems)
      }
      return false
    },
    showActions () {
      return !this.$isScopedPolicyMenuHidden('network_hidden_columns.perform_action')
    },
    exportDataOptions () {
      return {
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
        title: this.$t('network.text_565'),
        downloadType: 'local',
        hiddenFields: ['ip', 'ip6'],
        fixedItems: [
          { key: 'guest_ip_start', label: this.$t('network.text_607') },
          { key: 'guest_ip_end', label: this.$t('network.text_608') },
          { key: 'guest_ip_mask', label: this.$t('network.text_609') },
          { key: 'guest_ip6_start', label: this.$t('network.ipv6.ip_start.label') },
          { key: 'guest_ip6_end', label: this.$t('network.ipv6.ip_end.label') },
          { key: 'guest_ip6_mask', label: this.$t('network.ipv6.ip_mask.label') },
        ],
      }
    },
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('network-detail')
    this.list.fetchData()
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
    eachValidates (callback) {
      let f = true
      if (this.list.selectedItems && this.list.selectedItems.length > 0) {
        for (let i = 0; i < this.list.selectedItems.length; i++) {
          const item = this.list.selectedItems[i]
          if (callback && !callback(item)) {
            f = false
            break
          }
        }
      } else {
        f = false
      }
      return f
    },
    _border (first, second) {
      const firstArr = first.split('.')
      const secondArr = second.split('.')
      const firstNum = Number(firstArr[firstArr.length - 1])
      const secondNum = Number(secondArr[secondArr.length - 1])
      const diff = firstNum - secondNum
      return Math.abs(diff) === 1
    },
    _comparePre (first, second) {
      const firstArr = first.split('.')
      const secondArr = second.split('.')
      firstArr.pop()
      secondArr.pop()
      return firstArr.join('') === secondArr.join('')
    },
    link ([first, second]) {
      const start = 'guest_ip_start'
      const end = 'guest_ip_end'
      if (this._border(first[end], second[start]) && this._comparePre(first[end], second[start])) {
        this.IPfromObj = {
          IPfrom: first[start],
          name: first.id,
        }
        this.IPtoObj = {
          IPto: second[end],
          name: second.id,
        }
        return true
      } else if (this._border(second[end], first[start]) && this._comparePre(second[end], first[start])) {
        this.IPfromObj = {
          IPfrom: second[start],
          name: second.id,
        }
        this.IPtoObj = {
          IPto: first[end],
          name: first.id,
        }
        return true
      } else if (second.wire === first.wire) {
        this.IPfromObj = {
          IPfrom: second[start],
          name: second.id,
        }
        this.IPtoObj = {
          IPto: first[end],
          name: first.id,
        }
        return true
      } else {
        return false
      }
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'NetworkSidePage', {
        id: row.id,
        resource: 'networks',
        getParams: this.getParam,
      }, {
        list: this.list,
        hiddenActions: this.hiddenActions,
        hiddenColumns: this.hiddenColumns,
        tab,
      })
    },
    defaultSearchKey (search) {
      if (regexp.isIPv4(search)) {
        return 'ip_match'
      }
    },
  },
}
</script>
