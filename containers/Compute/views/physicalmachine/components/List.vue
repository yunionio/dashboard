<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :defaultSearchKey="defaultSearchKey"
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { canIpmiProbe } from '../utils/status'
import { getNameFilter, getStatusFilter, getEnabledFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'
import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import { hasServices } from '@/utils/auth'
import regexp from '@/utils/regexp'
import { hostCommonActions } from '../../../utils/hostActions'

export default {
  name: 'PhysicalmachineList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    filterParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'hosts',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.host).flat(),
        },
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          status: getStatusFilter('host'),
          enabled: getEnabledFilter(),
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
            label: this.$t('compute.text_503'),
            filter: true,
            formatter: val => {
              return `access_ip.contains("${val}")`
            },
          },
          ipmi_ip: {
            label: this.$t('compute.text_504'),
            filter: true,
            formatter: val => {
              return `ipmi_ip.contains("${val}")`
            },
          },
          is_maintenance: {
            label: this.$t('compute.text_820'),
            dropdown: true,
            items: [
              { label: this.$t('compute.text_820'), key: true },
              { label: this.$t('compute.text_821'), key: false },
            ],
          },
          project_domain: getProjectDomainFilter(),
          region: {
            label: this.$t('compute.text_177'),
          },
          zone: {
            label: this.$t('compute.text_270'),
          },
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'access_mac', 'sn', 'public_scope', 'project_domain', 'region'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_241'), key: 'enabled' },
          { label: this.$t('compute.text_268'), key: 'status' },
          { label: this.$t('compute.text_503'), key: 'access_ip' },
          { label: this.$t('compute.text_504'), key: 'ipmi_ip' },
          { label: this.$t('compute.text_847'), key: 'sys_info.manufacture' },
          { label: this.$t('compute.text_580'), key: 'sys_info.model' },
          { label: 'SN', key: 'sn' },
          { label: this.$t('compute.text_602'), key: 'server' },
          { label: this.$t('compute.text_820'), key: 'is_maintenance' },
          { label: this.$t('compute.text_177'), key: 'region' },
          { label: this.$t('compute.text_270'), key: 'zone' },
          {
            label: this.$t('compute.text_505'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('cloudaccounts'))
            },
          },
          { label: this.$t('compute.text_506', [this.$t('dictionary.domain')]), key: 'project_domain' },
        ],
      },
    }
  },
  computed: {
    groupActions () {
      return [
        {
          label: this.$t('compute.text_822'),
          action: () => {
            this.$router.push('/physicalmachine/add')
          },
          meta: () => {
            const ret = { validate: true, tooltip: '' }
            const hasBMAgent = hasServices('bmagent')
            if (!hasBMAgent) {
              ret.validate = false
              ret.tooltip = this.$t('compute.text_1334')
            }
            return {
              buttonType: 'primary',
              ...ret,
            }
          },
        },
        ...getEnabledSwitchActions(this, undefined),
        {
          label: this.$t('compute.text_275'),
          actions: (obj) => {
            return [
              ...hostCommonActions(this),
              getDomainChangeOwnerAction(this, {
                name: this.$t('dictionary.host'),
                resource: 'hosts',
              }),
              getSetPublicAction(this, {
                name: this.$t('dictionary.host'),
                scope: 'domain',
                resource: 'hosts',
              }),
              {
                label: this.$t('compute.host_ipmi_probe'),
                action: () => {
                  this.list.batchPerformAction('ipmi-probe', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    const obj = this.list.selectedItems[i]
                    if (!canIpmiProbe(obj)) {
                      return {
                        validate: false,
                      }
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: this.$t('compute.host_prepare'),
                action: () => {
                  this.list.batchPerformAction('prepare', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    const obj = this.list.selectedItems[i]
                    if (!obj.can_prepare) {
                      return {
                        validate: false,
                      }
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: this.$t('compute.text_541'),
                action: (obj) => {
                  this.createDialog('HostsAdjustLabelDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    name: this.$t('dictionary.physicalmachine'),
                  })
                },
                meta: () => ({
                  validate: this.list.selectedItems.length,
                }),
              },
              {
                label: this.$t('compute.text_283'),
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    params: {
                      resources: 'host',
                    },
                    mode: 'add',
                  })
                },
                meta: () => this.$isOwner(this.list.selectedItems),
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
                    onManager: this.onManager,
                  })
                },
                meta: () => ({
                  validate: this.$getDeleteResult(this.list.selectedItems).validate,
                  tooltip: this.$getDeleteResult(this.list.selectedItems).validate ? '' : this.$t('compute.text_826'),
                }),
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selected.length,
            }
          },
        },
      ]
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
                  label: this.$t(`status.server.${item}`),
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
    this.initSidePageTab('physicalmachine-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        with_meta: true,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'PhysicalmachineSidePage', {
        id: row.id,
        resource: 'hosts',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.host).flat(),
        },
      }, {
        list: this.list,
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
  },
}
</script>
