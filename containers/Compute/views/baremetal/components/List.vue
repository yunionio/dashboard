<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    :id="id"
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :defaultSearchKey="defaultSearchKey"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import { disableDeleteAction } from '@/utils/common/tableActions'
import { getNameFilter, getTenantFilter, getStatusFilter, getOsTypeFilter, getDomainFilter, getRegionFilter, getDescriptionFilter, getCreatedAtFilter, getBrandFilter, getAccountFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import GlobalSearchMixin from '@/mixins/globalSearch'
import regexp from '@/utils/regexp'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { cloudEnabled, cloudUnabledTip } from '../../vminstance/utils'

export default {
  name: 'BaremetalList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
    hiddenFilterOptions: {
      type: Array,
      default: () => ([]),
    },
    hostInfo: Object,
  },
  data () {
    const filterOptions = {
      id: {
        label: this.$t('table.title.id'),
      },
      name: getNameFilter(),
      description: getDescriptionFilter(),
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
      brand: getBrandFilter(),
      account: getAccountFilter(),
      region: getRegionFilter(),
      zone: {
        label: this.$t('res.zone'),
      },
      projects: getTenantFilter(),
      project_domains: getDomainFilter(),
      status: getStatusFilter({ statusModule: 'server' }),
      os_type: getOsTypeFilter(),
      created_at: getCreatedAtFilter(),
    }
    this.hiddenFilterOptions.forEach(key => {
      delete filterOptions[key]
    })
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servers',
        getParams: this.getParam,
        filterOptions,
        steadyStatus: Object.values(expectStatus.server).flat(),
        responseData: this.responseData,
        hiddenColumns: ['host_sn', 'created_at'],
      }),
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
          permission: 'server_create',
          action: () => {
            this.$router.push({
              path: '/baremetal/create',
              query: {
                type: 'baremetal',
                cloud_env: this.hostInfo?.brand === 'Cloudpods' ? 'private' : 'onpremise',
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
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => item.status === 'ready')
              return ret
            })
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
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => item.status === 'running')
              return ret
            })
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
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => ['running', 'stop_fail'].includes(item.status))
              return ret
            })
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
                        validate: false, // 已绑定密钥的虚拟机无法重置密码
                        tooltip: this.$t('compute.text_277'),
                      }
                    }
                    const items = this.list.selectedItems.map(item => {
                      return { ...item, brand: 'baremetal' }
                    })
                    return {
                      validate: cloudEnabled('resetPassword', items),
                      tooltip: cloudUnabledTip('resetPassword', items),
                    }
                  }
                  return {
                    validate: false,
                    tooltip: this.$t('compute.text_278'),
                  }
                },
              },
              {
                label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
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
                label: this.$t('compute.perform_sync_status'),
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
                label: this.$t('compute.vminstance.monitor.install_agent'),
                permission: 'server_perform_install_agent',
                action: () => {
                  this.createDialog('InstallAgentDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  let ret = {
                    validate: true,
                    tooltip: null,
                  }
                  ret.validate = this.list.selectedItems.length > 0
                  if (!ret.validate) return ret
                  ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
                    ret.validate = this.list.selectedItems.every(item => ['running'].includes(item.status))
                    return ret
                  })
                  return ret
                },
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_detect_ssh_proxy'),
              },
              {
                label: this.$t('table.action.set_tag'),
                permission: 'server_perform_set_user_metadata',
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
              disableDeleteAction(Object.assign(this, { permission: 'server_update' })),
              {
                label: this.$t('compute.perform_delete'),
                permission: 'server_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    title: this.$t('compute.perform_delete'),
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
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems)
            return ret
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
    exportDataOptions () {
      return {
        items: this.columns,
        downloadType: 'local',
        title: this.$t('compute.text_92'),
        getParams: () => ({ hypervisor: 'baremetal' }),
        fixedItems: [
          { key: 'vcpu_count', label: 'CPU' },
          { key: 'disk', label: this.$t('table.title.disk') + '(M)' },
          { key: 'vmem_size', label: this.$t('table.title.vmem_size') + '(M)' },
          { key: 'eip', title: this.$t('common.eip') },
          { key: 'ips', title: 'IP' },
        ],
        hiddenFields: ['ip'],
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
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'BaremetalSidePage', {
        id: row.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.image).flat(),
      }, {
        list: this.list,
        tab,
      })
    },
    defaultSearchKey (search) {
      if (regexp.isIPv4(search)) {
        return 'ips'
      }
    },
  },
}
</script>
