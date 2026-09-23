<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    :id="id"
    :list="list"
    :columns="templateListColumns || columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :show-single-actions="!isTemplate"
    :export-data-options="exportDataOptions"
    :defaultSearchKey="defaultSearchKey"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :show-page="!isTemplate" />
</template>

<script>
import * as R from 'ramda'
import { disableDeleteAction } from '@/utils/common/tableActions'
import { getNameFilter, getTenantFilter, getStatusFilter, getOsTypeFilter, getDomainFilter, getRegionFilter, getDescriptionFilter, getCreatedAtFilter, getBrandFilter, getAccountFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import expectStatus from '@/constants/expectStatus'
import GlobalSearchMixin from '@/mixins/globalSearch'
import regexp from '@/utils/regexp'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { getBatchStartAction } from '../utils/startActions'
import { getBatchRenewAction } from '../utils/renewActions'
import { cloudEnabled, cloudUnabledTip, commonEnabled, validateRescueMode } from '../../vminstance/utils'

export default {
  name: 'BaremetalList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
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
      billing_type: {
        label: this.$t('table.title.bill_type'),
        dropdown: true,
        items: [
          { label: this.$t('billingType.postpaid'), key: 'postpaid' },
          { label: this.$t('billingType.prepaid'), key: 'prepaid' },
        ],
      },
      created_at: getCreatedAtFilter(),
    }
    this.hiddenFilterOptions.forEach(key => {
      delete filterOptions[key]
    })
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servers',
        ctx: this,
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        filterOptions,
        steadyStatus: Object.values(expectStatus.server).flat(),
        responseData: this.responseData,
        hiddenColumns: ['host_sn', 'created_at'],
      }),
      groupActions: [
        // 创建裸金属
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
          hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_create'),
        },
        // 批量启动
        getBatchStartAction(this),
        // 批量关机
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
          hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_stop'),
        },
        // 批量重启
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
          hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_restart'),
        },
        // 更多批量操作
        {
          label: this.$t('compute.text_275'),
          actions: () => {
            return [
              // 续费
              getBatchRenewAction(this),
              // 重置密码
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
                hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_reset_password'),
              },
              // 批量变更归属项目
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
                hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_change_owner'),
              },
              // 批量同步状态
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
                hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_syncstatus'),
              },
              // 设置免密登录
              {
                label: this.$t('compute.vminstance.actions.setup_ssh_authentication'),
                permission: 'server_perform_setup_ssh_proxy',
                action: () => {
                  this.createDialog('SetupSSHDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  const items = this.list.selectedItems
                  const rescueModeValid = validateRescueMode(items)
                  if (!rescueModeValid.validate) return rescueModeValid
                  const project = (items[0] && items[0].project) || ''
                  const isSameProject = items.every(item => item.project === project)
                  if (!isSameProject) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.vminstance.setup_ssh_authentication.group_action.project')
                    return ret
                  }
                  const isLinux = items.every(item => item.os_type && item.os_type.toLowerCase() === 'linux')
                  if (!isLinux) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.text_362')
                    return ret
                  }
                  for (const item of items) {
                    if (!commonEnabled(item, ['running'])) {
                      ret.validate = false
                      ret.tooltip = this.$t('db.text_156')
                      return ret
                    }
                  }
                  return ret
                },
                hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_setup_ssh_proxy'),
              },
              // 探测免密登录
              {
                label: this.$t('compute.vminstance.actions.detect_ssh_authentication'),
                permission: 'server_perform_make_sshable',
                action: () => {
                  this.createDialog('DetectSSHDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  const items = this.list.selectedItems
                  const rescueModeValid = validateRescueMode(items)
                  if (!rescueModeValid.validate) return rescueModeValid
                  for (const item of items) {
                    if (!commonEnabled(item, ['running'])) {
                      ret.validate = false
                      ret.tooltip = this.$t('db.text_156')
                      return ret
                    }
                  }
                  return ret
                },
                hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_detect_ssh_proxy'),
              },
              // 批量安装Agent
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
                hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_install_agent'),
              },
              // 批量设置标签
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
                hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_set_user_metadata'),
              },
              // 批量设置删除保护
              disableDeleteAction(Object.assign(this, { permission: 'server_update' }), {
                hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_set_delete_protection'),
              }),
              // 批量删除
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
                hidden: () => this.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_delete'),
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
