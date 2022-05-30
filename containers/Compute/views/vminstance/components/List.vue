<template>
  <page-list
    show-tag-filter
    show-tag-columns
    show-tag-config
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :defaultSearchKey="defaultSearchKey"
    :before-show-menu="beforeShowMenu"
    :refresh-method="handleListRefresh"
    :tag-config-params="tagConfigParams" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { cloudEnabled, cloudUnabledTip, commonEnabled } from '../utils'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { SERVER_TYPE } from '@Compute/constants'
import ListMixin from '@/mixins/list'
import ResStatusFilterMixin from '@/mixins/resStatusFilterMixin'
import {
  getNameFilter,
  getBrandFilter,
  getStatusFilter,
  getDomainFilter,
  getTenantFilter,
  getAccountFilter,
  getHostFilter,
  getVpcFilter,
  getOsArchFilter,
  getRegionFilter,
  getCloudProviderFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'
import GlobalSearchMixin from '@/mixins/globalSearch'
import regexp from '@/utils/regexp'
import { hasSetupKey } from '@/utils/auth'

export default {
  name: 'VmInstanceList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResStatusFilterMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
    cloudEnvOptions: {
      type: Array,
    },
    hiddenFilterOptions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    const filter = {}
    if (this.$route.query.id) {
      filter.id = [this.$route.query.id]
    }
    const filterOptions = {
      external_id: {
        label: this.$t('table.title.external_id'),
      },
      id: {
        label: this.$t('table.title.id'),
      },
      name: getNameFilter(),
      description: getDescriptionFilter(),
      brand: getBrandFilter('compute_engine_brands'),
      ip_addr: {
        label: 'IP',
      },
      status: getStatusFilter('server'),
      os_type: {
        label: this.$t('table.title.os'),
        dropdown: true,
        multiple: true,
        items: [
          { label: 'Windows', key: 'windows' },
          { label: 'Linux', key: 'linux' },
          { label: 'VMware', key: 'VMWare' },
        ],
        filter: true,
        formatter: val => {
          return `os_type.in(${val})`
        },
      },
      projects: getTenantFilter(),
      project_domains: getDomainFilter(),
      billing_type: {
        label: this.$t('table.title.bill_type'),
        dropdown: true,
        items: [
          { label: this.$t('billingType.postpaid'), key: 'postpaid' },
          { label: this.$t('billingType.prepaid'), key: 'prepaid' },
        ],
      },
      cloudaccount: getAccountFilter(),
      manager: getCloudProviderFilter(),
      host: getHostFilter(),
      server_type: {
        label: this.$t('table.title.type'),
        dropdown: true,
        items: [
          { label: this.$t('compute.text_291', [this.$t('dictionary.server')]), key: 'normal' },
          { label: `GPU${this.$t('dictionary.server')}`, key: 'gpu' },
          { label: `USB${this.$t('dictionary.server')}`, key: 'usb' },
          { label: this.$t('compute.backup'), key: 'backup' },
        ],
      },
      region: getRegionFilter(),
      vpc: getVpcFilter(),
      os_arch: getOsArchFilter(),
      // vmem_size: {
      //   label: this.$t('table.title.vmem_size'),
      // },
      vcpu_count: {
        label: 'CPU',
      },
      // disk: {
      //   label: this.$t('table.title.disk'),
      // },
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
        steadyStatus: {
          status: Object.values(expectStatus.server).flat(),
          checkBackup: (val) => {
            return val.metadata && (val.metadata.create_backup || val.metadata.switch_backup)
          },
        },
        filter,
        filterOptions,
        responseData: this.responseData,
        hiddenColumns: ['is_gpu', 'metadata', 'instance_type', 'os_type', 'vpc', 'host', 'account', 'created_at', 'macs', 'os_arch', 'vcpu_count', 'vmem_size', 'disk'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.external_id'), key: 'external_id' },
          { label: this.$t('table.title.name'), key: 'name' },
          { label: 'IP', key: 'ips' },
          { label: 'EIP', key: 'eip' },
          { label: this.$t('table.title.type'), key: 'instance_type' },
          { label: this.$t('table.title.os'), key: 'os_distribution' },
          { label: this.$t('common.status'), key: 'status' },
          { label: this.$t('res.project'), key: 'tenant' },
          { label: this.$t('table.title.brand'), key: 'hypervisor' },
          { label: this.$t('res.host'), key: 'host', hidden: () => this.$store.getters.isProjectMode },
          { label: this.$t('res.cloudaccount'), key: 'manager', hidden: () => this.$store.getters.isProjectMode },
          { label: this.$t('res.region'), key: 'region' },
          { label: this.$t('res.zone'), key: 'zone' },
          { label: this.$t('table.title.bill_type'), key: 'billing_type' },
          { label: this.$t('table.title.user_tag'), key: 'user_tags' },
          { label: 'MAC', key: 'macs' },
          { label: this.$t('table.title.os_arch'), key: 'os_arch' },
          { label: 'CPU', key: 'vcpu_count' },
          { label: this.$t('table.title.memory_mb'), key: 'vmem_size' },
          { label: this.$t('table.title.disk_mb'), key: 'disk' },
          { label: this.$t('common.createdAt'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
          permission: 'server_create',
          action: () => {
            this.$openNewWindowForMenuHook('vminstance_configured_callback_address.create_callback_address', () => {
              this.$router.push({
                path: '/vminstance/create',
                query: {
                  type: this.cloudEnv === 'onpremise' ? 'idc' : this.cloudEnv || 'idc',
                },
              })
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: !this.cloudEnvEmpty,
              tooltip: this.cloudEnvEmpty ? this.$t('common.no_platform_available') : '',
            }
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_create'),
        },
        {
          label: this.$t('compute.text_272'),
          permission: 'server_perform_start',
          action: () => {
            const ids = this.list.selectedItems.map(item => item.id)
            this.list.onManager('batchPerformAction', {
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
            // 某些云不支持
            const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems)
            if (!unenableCloudCheck.validate) {
              ret = unenableCloudCheck
              return ret
            }
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => item.status === 'ready')
              return ret
            })
            return ret
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start'),
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
            // 某些云不支持
            const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems)
            if (!unenableCloudCheck.validate) {
              ret = unenableCloudCheck
              return ret
            }
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => item.status === 'running')
              return ret
            })
            return ret
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_stop'),
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
            // 某些云不支持
            const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems)
            if (!unenableCloudCheck.validate) {
              ret = unenableCloudCheck
              return ret
            }
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => ['running', 'stop_fail'].includes(item.status))
              return ret
            })
            return ret
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_restart'),
        },
        {
          label: this.$t('compute.text_275'),
          actions: () => {
            return [
              {
                /* 实例状态 */
                label: this.$t('compute.text_353'),
                submenus: [
                  {
                    label: this.$t('compute.perform_sync_status'),
                    permission: 'server_perform_syncstatus',
                    action: () => {
                      this.onManager('batchPerformAction', {
                        steadyStatus: ['running', 'ready'],
                        managerArgs: {
                          action: 'syncstatus',
                        },
                      })
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_syncstatus'),
                  },
                  {
                    label: this.$t('compute.text_1128'), // 挂起
                    permission: 'server_perform_suspend',
                    action: () => {
                      this.createDialog('VmSuspendDialog', {
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
                      const isAllVMware = this.list.selectedItems.every(item => item.hypervisor === typeClouds.hypervisorMap.esxi.key || item.hypervisor === typeClouds.hypervisorMap.kvm.key)
                      const isAllRunning = this.list.selectedItems.every(item => item.status === 'running')
                      if (!isAllVMware) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1129')
                        return ret
                      }
                      if (!isAllRunning) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1130')
                        return ret
                      }
                      ret.validate = true
                      return ret
                    },
                    hidden: () => !hasSetupKey(['vmware', 'onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_suspend'),
                  },
                  {
                    label: this.$t('compute.text_478'), // 恢复
                    permission: 'server_perform_resume',
                    action: () => {
                      this.createDialog('VmResumeDialog', {
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
                      const isAllVMware = this.list.selectedItems.every(item => item.hypervisor === typeClouds.hypervisorMap.esxi.key || item.hypervisor === typeClouds.hypervisorMap.kvm.key)
                      const isAllSuspend = this.list.selectedItems.every(item => item.status === 'suspend')
                      if (!isAllVMware) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1129')
                        return ret
                      }
                      if (!isAllSuspend) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1131')
                        return ret
                      }
                      ret.validate = true
                      return ret
                    },
                    hidden: () => !hasSetupKey(['vmware', 'onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_resume'),
                  },
                  {
                    label: this.$t('compute.sync_config'), // 推送配置
                    permission: 'server_perform_sync_config',
                    action: () => {
                      this.createDialog('VmSyncConfigDialog', {
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
                      const isAllKVM = this.list.selectedItems.every(item => item.hypervisor === typeClouds.hypervisorMap.kvm.key)
                      const isAllRunningReady = this.list.selectedItems.every(item => (item.status === 'running' || item.status === 'ready'))
                      if (!isAllKVM) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1388')
                        return ret
                      }
                      if (!isAllRunningReady) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1126')
                        return ret
                      }
                      ret.validate = true
                      return ret
                    },
                    hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_sync_config'),
                  },
                ],
              },
              {
                /* 实例设置 */
                label: this.$t('compute.text_356'),
                submenus: [
                  {
                    label: this.$t('compute.text_247'),
                    permission: 'server_update',
                    action: () => {
                      this.createDialog('VmUpdateDialog', {
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                      })
                    },
                    meta: (row) => {
                      const isOneCloud = this.list.selectedItems.every(item => item.brand === 'OneCloud')
                      return {
                        validate: isOneCloud,
                        tooltip: !isOneCloud && this.$t('compute.text_355'),
                      }
                    },
                    hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_update'),
                  },
                  {
                    label: this.$t('compute.text_357'),
                    permission: 'server_perform_rebuild_root',
                    action: () => {
                      this.createDialog('VmRebuildRootDialog', {
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
                      if (this.isSameHyper) {
                        ret.validate = cloudEnabled('rebuildRoot', this.list.selectedItems)
                        ret.tooltip = cloudUnabledTip('rebuildRoot', this.list.selectedItems)
                        return ret
                      }

                      // same cpu arch
                      if (!this.isSameArch) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.vminstance.actions.adjust_config.cpu_arch.tips')
                        return ret
                      }
                      ret.validate = false
                      ret.tooltip = this.$t('compute.text_278')
                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_rebuild_root'),
                  },
                  {
                    label: this.$t('compute.text_1100'),
                    permission: 'server_perform_change_config',
                    action: () => {
                      this.$openNewWindowForMenuHook('vminstance_configured_callback_address.adjust_configuration_callback_address', () => {
                        this.$router.push({
                          name: 'VMInstanceAdjustConfig',
                          query: {
                            id: this.list.selectedItems.map((item) => { return item.id }),
                          },
                        })
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: true,
                        tooltip: null,
                      }
                      if (this.isSameHyper) {
                        const isSomeBackupHost = this.list.selectedItems.some((item) => { return item.backup_host_id })
                        if (isSomeBackupHost) {
                          ret.validate = false
                          ret.tooltip = this.$t('compute.text_1111')
                          return ret
                        }
                        ret.validate = cloudEnabled('adjustConfig', this.list.selectedItems)
                        ret.tooltip = cloudUnabledTip('adjustConfig', this.list.selectedItems)
                        // const googleItems = this.list.selectedItems.filter(val => val.brand === typeClouds.brandMap.Google.key)
                        // if (googleItems && googleItems.length) { // 谷歌云 windows 仅支持关机下操作，linux 支持 开关机
                        //   ret.validate = googleItems.every(val => {
                        //     const os = val.os_type.toLowerCase()
                        //     if (os.includes('windows')) {
                        //       return val.status === 'ready'
                        //     }
                        //     if (os.includes('linux')) {
                        //       return val.status === 'ready' || val.status === 'running'
                        //     }
                        //     return true
                        //   })
                        //   if (!ret.validate) {
                        //     ret.tooltip = '谷歌云Windows虚拟机仅支持关机下操作，Linux虚拟机支持开机和关机下操作'
                        //   }
                        // }
                        // same cpu arch
                        if (!this.isSameArch) {
                          ret.validate = false
                          ret.tooltip = this.$t('compute.vminstance.actions.adjust_config.cpu_arch.tips')
                          return ret
                        }
                        return ret
                      }
                      ret.validate = false
                      ret.tooltip = this.$t('compute.text_278')
                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_change_config'),
                  },
                  {
                    label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
                    permission: 'server_perform_change_owner',
                    action: () => {
                      this.createDialog('ChangeOwenrDialog', {
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                        name: this.$t('dictionary.server'),
                        resource: 'servers',
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: true,
                        tooltip: null,
                      }
                      if (!this.isAdminMode && !this.isDomainMode) {
                        ret.validate = false
                        ret.tooltip = `仅系统或${this.$t('dictionary.domain')}管理员支持该操作`
                        return ret
                      }
                      const domains = this.list.selectedItems.map(item => item.domain_id)
                      if (R.uniq(domains).length !== 1) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_280', [this.$t('dictionary.domain')])
                        return ret
                      }
                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_change_owner'),
                  },
                  {
                    label: this.$t('compute.text_283'),
                    permission: 'server_perform_set_user_metadata',
                    action: () => {
                      this.createDialog('SetTagDialog', {
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                        params: {
                          resources: 'server',
                        },
                        mode: 'add',
                      })
                    },
                    meta: () => {
                      let ret = { validate: true }
                      // 某些云不支持
                      const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems)
                      if (!unenableCloudCheck.validate) {
                        ret = unenableCloudCheck
                        return ret
                      }
                      return ret
                    },
                  },
                  {
                    label: this.$t('compute.text_1132'),
                    permission: 'server_perform_cancel_expire',
                    action: () => {
                      this.createDialog('SetDurationDialog', {
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                        refresh: this.refresh,
                        alert: this.$t('compute.text_1391'),
                      })
                    },
                    meta: () => {
                      let ret = {
                        validate: false,
                        tooltip: null,
                      }
                      // 包年包月机器，不支持此操作
                      const isSomePrepaid = this.list.selectedItems.some((item) => {
                        return item.billing_type === 'prepaid'
                      })
                      if (isSomePrepaid) {
                        ret.tooltip = this.$t('compute.text_285')
                        return ret
                      }
                      // 某些云不支持
                      const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems)
                      if (!unenableCloudCheck.validate) {
                        ret = unenableCloudCheck
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
                        ret.tooltip = this.$t('compute.text_1133')
                        return ret
                      }
                      ret.validate = true
                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_cancel_expire'),
                  },
                  {
                    label: this.$t('compute.text_1112'),
                    permission: 'attach-isolated-device,server_perform_detach_isolated_device,server_perform_set_isolated_device',
                    action: () => {
                      this.createDialog('VmAttachGpuDialog', {
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
                      const isAllReady = this.list.selectedItems.every((item) => { return item.status === 'ready' })
                      const isAllIdc = this.list.selectedItems.every((item) => {
                        return findPlatform(item.hypervisor, 'hypervisor') === SERVER_TYPE.idc
                      })
                      const isAllAdmin = this.list.selectedItems.every((item) => {
                        return this.isAdminMode
                      })
                      // 某些云不支持
                      const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems, [typeClouds.hypervisorMap.bingocloud.key, 'esxi'])
                      if (!isAllAdmin) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1113')
                        return ret
                      }
                      if (!isAllReady) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1114')
                        return ret
                      }
                      if (!isAllIdc) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1115')
                        return ret
                      }
                      if (!unenableCloudCheck.validate) {
                        ret = unenableCloudCheck
                        return ret
                      }
                      return ret
                    },
                    hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_gpu'),
                  },
                  {
                    label: this.$t('compute.text_1208'),
                    permission: 'server_perform_snapshot_and_clone',
                    action: () => {
                      this.$openNewWindowForMenuHook('vminstance_configured_callback_address.host_clone_callback_address', () => {
                        this.createDialog('VmCloneDeepDialog', {
                          data: this.list.selectedItems,
                          columns: this.columns,
                          onManager: this.onManager,
                          refresh: this.refresh,
                        })
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: true,
                        tooltip: null,
                      }
                      for (const obj of this.list.selectedItems) {
                        if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                          ret.validate = false
                          ret.tooltip = this.$t('compute.text_355')
                          break
                        }
                        if (!['running', 'ready'].includes(obj.status)) {
                          ret.validate = false
                          ret.tooltip = this.$t('compute.text_1126')
                          break
                        }
                        if (obj.backup_host_id) {
                          ret.validate = false
                          ret.tooltip = this.$t('compute.text_1283')
                          break
                        }
                      }
                      return ret
                    },
                    hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_clone'),
                  },
                  {
                    label: this.$t('compute.text_1117'),
                    permission: 'server_perform_renew',
                    action: () => {
                      this.createDialog('VmResourceFeeDialog', {
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
                      const isAllPublic = this.list.selectedItems.every(item => findPlatform(item.hypervisor) === SERVER_TYPE.public)
                      const isAllPrepaid = this.list.selectedItems.every(item => item.billing_type === 'prepaid')
                      if (!isAllPublic) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1118')
                      }
                      if (!isAllPrepaid) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1119')
                      }
                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_Renew'),
                  },
                  {
                    label: this.$t('compute.text_1120'),
                    permission: 'server_perform_aet_auto_renew',
                    action: () => {
                      this.createDialog('VmResourceRenewFeeDialog', {
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                        refresh: this.refresh,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: true,
                        tooltip: null,
                      }
                      const isAllPublic = this.list.selectedItems.every(item => findPlatform(item.hypervisor) === SERVER_TYPE.public)
                      const isAllPrepaid = this.list.selectedItems.every(item => item.billing_type === 'prepaid')
                      if (!isAllPublic) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1118')
                      }
                      if (!isAllPrepaid) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1119')
                      }
                      return ret
                    },
                    hidden: () => !(hasSetupKey(['aliyun', 'qcloud', 'huawei', 'ucloud', 'ecloud', 'jdcloud', 'ctyun'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_auto_renewal'),
                  },
                ],
              },
              {
                /* 密码密钥 */
                label: this.$t('compute.text_360'),
                submenus: [
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
                      const ret = {
                        validate: true,
                        tooltip: null,
                      }
                      const isBindKeypair = this.list.selectedItems.some((item) => { return item.keypair_id && item.keypair_id.toLowerCase() !== 'none' })
                      if (isBindKeypair) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_277')
                        return ret
                      }
                      return {
                        validate: cloudEnabled('resetPassword', this.list.selectedItems),
                        tooltip: cloudUnabledTip('resetPassword', this.list.selectedItems),
                      }
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_deploy'),
                  },
                  /* 设置免密登录 */
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

                      if (this.list.selectedItems) {
                        const project = this.list.selectedItems[0].project || ''
                        const isSame = this.list.selectedItems.every((item) => {
                          return item.project === project
                        })
                        if (!isSame) {
                          ret.validate = false
                          ret.tooltip = this.$t('compute.vminstance.setup_ssh_authentication.group_action.project')
                          return ret
                        }

                        const isLinux = this.list.selectedItems.every((item) => {
                          return item.os_type && item.os_type.toLowerCase() === 'linux'
                        })
                        if (!isLinux) {
                          ret.validate = false
                          ret.tooltip = this.$t('compute.text_362')
                          return ret
                        }
                      }

                      for (const obj of this.list.selectedItems) {
                        if (!commonEnabled(obj, ['running'])) {
                          ret.validate = false
                          ret.tooltip = this.$t('db.text_156')
                          return ret
                        }
                      }
                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_setup_ssh_proxy'),
                  },
                  /* 探测免密登录 */
                  {
                    label: this.$t('compute.vminstance.actions.detect_ssh_authentication'),
                    permission: 'server_perform_detect_ssh_proxy',
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
                      for (const obj of this.list.selectedItems) {
                        if (!commonEnabled(obj, ['running'])) {
                          ret.validate = false
                          ret.tooltip = this.$t('db.text_156')
                          return ret
                        }
                      }
                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_detect_ssh_proxy'),
                  },
                ],
              },
              {
                /* 网络安全 */
                label: this.$t('compute.text_1290'),
                submenus: [
                  {
                    label: this.$t('compute.text_1116'),
                    permission: 'server_perform_add_secgroup',
                    action: () => {
                      this.createDialog('VmSetSecgroupDialog', {
                        vm: this,
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: cloudEnabled('assignSecgroup', this.list.selectedItems),
                        tooltip: cloudUnabledTip('assignSecgroup', this.list.selectedItems),
                      }
                      return ret
                    },
                    hidden: () => !(hasSetupKey(['onestack', 'onecloud', 'public', 'openstack', 'dstack', 'zstack', 'apsara', 'cloudpods', 'hcso'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_secgroup'),
                  },
                  {
                    label: this.$t('compute.text_1121'),
                    permission: 'server_perform_publicip_to_eip',
                    action: () => {
                      this.createDialog('VmPublicIpToEipDialog', {
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
                      const isSomeBindEip = this.list.selectedItems.some((item) => { return item.eip && item.eip_mode === 'elastic_ip' })
                      const isAllBindPublicIp = this.list.selectedItems.every((item) => { return item.eip_mode === 'public_ip' })
                      if (isSomeBindEip) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1122')
                        return ret
                      }
                      if (!isAllBindPublicIp) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1123')
                        return ret
                      }
                      ret.validate = cloudEnabled('publicIpToEip', this.list.selectedItems)
                      ret.tooltip = cloudUnabledTip('publicIpToEip', this.list.selectedItems)
                      return ret
                    },
                    hidden: () => !(hasSetupKey(['aliyun', 'qcloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_public_ip_to_eip'),
                  },
                  {
                    label: this.$t('compute.text_1124'),
                    permission: 'server_perform_modify_src_check',
                    action: () => {
                      this.createDialog('VmSourceTargetCheckDialog', {
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                        refresh: this.refresh,
                      })
                    },
                    meta: () => {
                      const ret = { validate: true, tooltip: null }
                      const isAllOneCloud = this.list.selectedItems.every((item) => { return item.hypervisor === typeClouds.hypervisorMap.kvm.key })
                      const isOk = this.list.selectedItems.every((item) => { return ['running', 'ready'].includes(item.status) })
                      if (!isAllOneCloud) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1125')
                        return ret
                      }
                      if (!isOk) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1126')
                        return ret
                      }
                      return ret
                    },
                    hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_source_check'),
                  },
                ],
              },
              {
                /* 高可用 */
                label: this.$t('compute.text_1295'),
                submenus: [
                  {
                    label: this.$t('compute.text_1127'),
                    permission: 'server_perform_migrate,server_perform_live_migrate',
                    action: () => {
                      this.createDialog('VmTransferDialog', {
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
                      let isOk = this.list.selectedItems.every((item) => {
                        return ['running', 'ready', 'unknown'].includes(item.status)
                      })
                      if (isOk) {
                        isOk = this.list.selectedItems.every((item) => {
                          if (item.backup_host_id) {
                            return false
                          }
                          if (item.status === 'running') {
                            return !item.is_gpu && !item.cdrom
                          }
                          return true
                        })
                      }
                      if (!isOk) {
                        ret.validate = false
                        return ret
                      }
                      if (!this.isAdminMode) {
                        ret.validate = false
                        return ret
                      }
                      if (this.list.selectedItems.some(item => item.hypervisor !== 'kvm' && item.hypervisor !== 'openstack')) {
                        ret.validate = false
                        return ret
                      }
                      return ret
                    },
                    hidden: () => !(hasSetupKey(['onecloud', 'openstack'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_transfer'),
                  },
                ],
              },
              {
                /* 删除 */
                label: this.$t('compute.perform_delete'),
                submenus: [
                  disableDeleteAction(Object.assign(this, {
                    permission: 'server_update',
                  }), {
                    name: this.$t('dictionary.server'),
                    meta: () => {
                      // 某些云不支持
                      const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems)
                      return unenableCloudCheck
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_set_delete_protection'),
                  }),
                  {
                    label: this.$t('compute.perform_delete'),
                    permission: 'server_delete',
                    action: () => {
                      this.$openNewWindowForMenuHook('vminstance_configured_callback_address.delete_callback_address', () => {
                        this.createDialog('DeleteVmDialog', {
                          vm: this,
                          data: this.list.selectedItems,
                          columns: this.columns,
                          onManager: this.onManager,
                          title: this.$t('compute.perform_delete'),
                        })
                      })
                    },
                    meta: () => {
                      const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems)
                      if (!unenableCloudCheck.validate) {
                        return unenableCloudCheck
                      }
                      const isHasRunning = this.list.selectedItems.some((item) => item.status === 'running')
                      const { server_delete_limit = false } = this.$store.getters.globalSetting.value || {}
                      if (server_delete_limit && isHasRunning) {
                        return {
                          validate: false,
                          tooltip: this.$t('compute.delete_limit'),
                        }
                      }
                      return this.$getDeleteResult(this.list.selectedItems)
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_delete'),
                  },
                ],
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
      execLoading: false,
      tagConfigParams: {
        title: this.$t('common.text00124'),
        resource: 'servers',
        queryTreeId: 'project-tag-value-tree',
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    isSameHyper () {
      if (this.list.selectedItems.length > 0) {
        const arr = this.list.selectedItems.map(v => v.hypervisor)
        const noRepeatArr = Array.from(new Set(arr))
        return noRepeatArr.length === 1
      }
      return true
    },
    isSameArch () {
      if (this.list.selectedItems[0] && this.list.selectedItems[0].hypervisor.toLowerCase() === 'hcso') {
        const instancetype = this.list.selectedItems[0].instance_type || ''
        const isArm = instancetype.startsWith('k')
        return this.list.selectedItems.every(item => item.instance_type && item.instance_type.startsWith('k') === isArm)
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
    this.initSidePageTab('vm-instance-detail')
    this.list.fetchData().then(() => {
      this.$nextTick(() => {
        if (this.$route.query.id && this.list.data[this.$route.query.id]) {
          this.handleOpenSidepage(this.list.data[this.$route.query.id].data)
        }
      })
    })
    this.$bus.$on('VMInstanceListSingleUpdate', args => {
      this.list.singleUpdate(...args)
    }, this)
    this.$bus.$on('VMInstanceListSingleRefresh', args => {
      this.list.singleRefresh(...args)
    }, this)
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        filter: 'hypervisor.notin(baremetal,container)',
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'VmInstanceSidePage', {
        id: row.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.server).flat(),
      }, {
        list: this.list,
      })
    },
    beforeShowMenu () {
      return this.$store.dispatch('scopedPolicy/get', {
        category: ['vminstance_hidden_menus', 'vminstance_configured_callback_address'],
      })
    },
    defaultSearchKey (search) {
      if (regexp.isIPv4(search)) {
        return 'ip_addr'
      }
    },
    handleListRefresh () {
      this.$emit('refresh')
      this.list.refresh()
      // 新建按钮无法点击时，刷新云资源情况
      this.cloudEnvEmpty && this.$store.dispatch('auth/getCapabilities')
    },
    hasSomeCloud (selectItems, clouds = [typeClouds.hypervisorMap.bingocloud.key]) {
      const ret = { validate: true, tooltip: '' }
      const hasList = selectItems.filter(item => clouds.includes(item.hypervisor))
      if (hasList && hasList[0]) {
        ret.validate = false
        ret.tooltip = this.$t('compute.text_473', [typeClouds.hypervisorMap[hasList[0].hypervisor].label])
      }
      return ret
    },
  },
}
</script>
