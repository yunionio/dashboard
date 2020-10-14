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
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter, getStatusFilter, getEnabledFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'
import { getDomainChangeOwnerAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
// import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import { hasServices } from '@/utils/auth'

export default {
  name: 'PhysicalmachineList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
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
              {
                label: this.$t('compute.text_272'),
                action: (obj) => {
                  this.list.batchPerformAction('start', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                      tooltip: this.$t('compute.text_823'),
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    const obj = this.list.selectedItems[i]
                    if (!obj.is_baremetal) {
                      return {
                        validate: false,
                        tooltip: this.$t('compute.text_823'),
                      }
                    }
                    if (obj.server_id && obj.host_type === 'baremetal') {
                      return {
                        validate: false,
                      }
                    }
                    if (obj.status !== 'ready') {
                      return {
                        validate: false,
                        tooltip: this.$t('compute.text_823'),
                      }
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: this.$t('compute.text_273'),
                action: (obj) => {
                  this.list.batchPerformAction('stop', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                      tooltip: this.$t('compute.text_824'),
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    const obj = this.list.selectedItems[i]
                    if (!obj.is_baremetal) {
                      return {
                        validate: false,
                        tooltip: this.$t('compute.text_824'),
                      }
                    }
                    if (obj.server_id && obj.host_type === 'baremetal') {
                      return {
                        validate: false,
                      }
                    }
                    if (obj.status !== 'running') {
                      return {
                        validate: false,
                        tooltip: this.$t('compute.text_824'),
                      }
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: this.$t('compute.text_550'),
                action: () => {
                  this.list.batchPerformAction('maintenance', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    const obj = this.list.selectedItems[i]
                    if (obj.server) {
                      return {
                        validate: false,
                      }
                    }
                    if (!obj.is_baremetal) {
                      return {
                        validate: false,
                      }
                    }
                    if (!obj.server_id) {
                      return {
                        validate: false,
                      }
                    }
                    if (obj.is_maintenance) {
                      return {
                        validate: false,
                      }
                    }
                    if (['running', 'ready'].indexOf(obj.status) < 0) {
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
                label: this.$t('compute.text_559'),
                action: () => {
                  this.list.batchPerformAction('unmaintenance', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    const obj = this.list.selectedItems[i]
                    if (obj.server) {
                      return {
                        validate: false,
                      }
                    }
                    if (!obj.is_baremetal) {
                      return {
                        validate: false,
                      }
                    }
                    if (!obj.server_id) {
                      return {
                        validate: false,
                      }
                    }
                    if (!obj.is_maintenance) {
                      return {
                        validate: false,
                      }
                    }
                    if (['running', 'ready'].indexOf(obj.status) < 0) {
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
                label: this.$t('compute.text_282'),
                action: () => {
                  this.list.batchPerformAction('syncstatus', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    const obj = this.list.selectedItems[i]
                    if (!obj.is_baremetal) {
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
              getDomainChangeOwnerAction(this, {
                name: this.$t('dictionary.host'),
                resource: 'hosts',
              }),
              // getSetPublicAction(this, {
              //   name: this.$t('dictionary.host'),
              //   scope: 'domain',
              //   resource: 'hosts',
              // }),
              {
                label: this.$t('compute.text_825'),
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
                label: this.$t('compute.text_261'),
                permission: 'hosts_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('compute.text_261'),
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
  },
}
</script>
