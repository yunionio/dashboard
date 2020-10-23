<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :id="id"
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
import { cloudEnabled, cloudUnabledTip } from '../../vminstance/utils'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { disableDeleteAction } from '@/utils/common/tableActions'
import { getNameFilter, getTenantFilter, getStatusFilter, getOsTypeFilter, getDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'BaremetalList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
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
        resource: 'servers',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          ips: {
            label: 'IP',
            filter: true,
            formatter: val => {
              return `guestnetworks.guest_id(id).ip_addr.contains("${val}")`
            },
            jointFilter: true,
          },
          host_sn: {
            label: 'SN',
            distinctField: {
              type: 'extra_field',
              key: 'account',
            },
          },
          host: {
            label: this.$t('res.machine'),
            hidden: () => this.$store.getters.isProjectMode,
          },
          region: {
            label: this.$t('res.region'),
          },
          zone: {
            label: this.$t('res.zone'),
          },
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          status: getStatusFilter({ statusModule: 'server' }),
          os_type: getOsTypeFilter(),
        },
        steadyStatus: Object.values(expectStatus.server).flat(),
        responseData: this.responseData,
        hiddenColumns: ['host_sn'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.name'), key: 'name' },
          { label: 'IP', key: 'ips' },
          { label: 'CPU', key: 'vcpu_count' },
          { label: this.$t('table.title.memory_mb'), key: 'vmem_size' },
          { label: this.$t('table.title.disk_mb'), key: 'disk' },
          { label: this.$t('table.title.type'), key: 'instance_type' },
          { label: this.$t('table.title.os'), key: 'os_distribution' },
          { label: this.$t('common.status'), key: 'status' },
          { label: this.$t('res.project'), key: 'tenant' },
          { label: this.$t('table.title.brand'), key: 'hypervisor' },
          { label: this.$t('res.cloudaccount'), key: 'manager', hidden: () => this.$store.getters.isProjectMode },
          { label: this.$t('res.region'), key: 'region' },
          { label: this.$t('res.zone'), key: 'zone' },
          { label: this.$t('table.title.user_tag'), key: 'user_tags' },
        ],
        getParams: () => ({ hypervisor: 'baremetal' }),
      },
      groupActions: [
        {
          label: this.$t('compute.text_18'),
          permission: 'server_create',
          action: () => {
            this.$router.push({
              path: '/baremetal/create',
              query: {
                type: 'baremetal',
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('compute.text_272'),
          permission: 'server_perform_start',
          action: () => {
            const ids = this.list.selectedItems.map(item => item.id)
            this.onManager('batchPerformAction', {
              steadyStatus: 'running',
              id: ids,
              managerArgs: {
                action: 'start',
              },
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0 && this.list.selectedItems.every(item => item.status === 'ready')
            return ret
          },
        },
        {
          label: this.$t('compute.text_273'),
          permission: 'server_perform_stop',
          action: () => {
            this.createDialog('VmShutDownDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0 && this.list.selectedItems.every(item => item.status === 'running')
            return ret
          },
        },
        {
          label: this.$t('compute.text_274'),
          permission: 'server_perform_restart',
          action: () => {
            this.createDialog('VmRestartDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0 && this.list.selectedItems.every(item => ['running', 'stop_fail'].includes(item.status))
            return ret
          },
        },
        {
          label: this.$t('compute.text_275'),
          actions: () => {
            return [
              {
                label: this.$t('compute.text_276'),
                permission: 'server_perform_deploy',
                action: () => {
                  this.createDialog('VmResetPasswordDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  if (this.isSameHyper) {
                    const hasKeypair = this.list.selectedItems.some(obj => obj.keypair_id && obj.keypair_id.toLowerCase() !== 'none')
                    if (hasKeypair) {
                      return {
                        validate: false, // 已绑定密钥的云服务器无法重置密码
                        tooltip: this.$t('compute.text_277'),
                      }
                    }
                    return {
                      validate: cloudEnabled('resetPassword', this.list.selectedItems),
                      tooltip: cloudUnabledTip('resetPassword', this.list.selectedItems),
                    }
                  }
                  return {
                    validate: false,
                    tooltip: this.$t('compute.text_278'),
                  }
                },
              },
              {
                label: this.$t('compute.text_279', [this.$t('dictionary.project')]),
                permission: 'server_perform_change_owner',
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    resource: 'servers',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  const domains = this.list.selectedItems.map(item => item.domain_id)
                  if (R.uniq(domains).length !== 1) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.text_280', [this.$t('dictionary.domain')])
                    return ret
                  }
                  return ret
                },
              },
              {
                label: this.$t('compute.text_282'),
                permission: 'server_perform_syncstatus',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: Object.values(expectStatus.server).flat(),
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
              },
              {
                label: this.$t('table.action.set_tag'),
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'server',
                    },
                  })
                },
              },
              disableDeleteAction(this),
              {
                label: this.$t('compute.text_261'),
                permission: 'server_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    title: this.$t('compute.text_261'),
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (this.list.selectedItems.some(item => item.billing_type === 'prepaid')) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.text_285')
                    return ret
                  }
                  return this.$getDeleteResult(this.list.selectedItems)
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
    }
  },
  computed: {
    isSameHyper () {
      if (this.list.selectedItems.length > 0) {
        const arr = this.list.selectedItems.map(v => v.hypervisor)
        const noRepeatArr = Array.from(new Set(arr))
        return noRepeatArr.length === 1
      }
      return true
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
    this.initSidePageTab('baremetal-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        hypervisor: 'baremetal',
        ...this.getParams,
        details: true,
        with_meta: true,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'BaremetalSidePage', {
        id: row.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.image).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
