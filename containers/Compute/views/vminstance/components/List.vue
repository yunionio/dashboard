<template>
  <page-list
    :fixed="true"
    show-tag-filter
    show-tag-columns
    show-tag-columns2
    show-tag-config
    :list="list"
    :columns="columns"
    :show-single-actions="showActions"
    :show-group-actions="showGroupActions && showActions"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :defaultSearchKey="defaultSearchKey"
    :refresh-method="handleListRefresh"
    :tag-config-params="tagConfigParams"
    :tableOverviewIndexs="tableOverviewIndexs" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import _ from 'lodash'
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
  getZoneFilter,
  getCloudProviderFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'
import { getIpsTableColumn } from '@/utils/common/tableColumn'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'
import GlobalSearchMixin from '@/mixins/globalSearch'
import regexp from '@/utils/regexp'
import { hasSetupKey } from '@/utils/auth'
import { sizeToDesignatedUnit } from '@/utils/utils'
import { Manager } from '@/utils/manager'
import { PROVIDER_MAP, BRAND_MAP } from '@/constants'
import { KVM_SHARE_STORAGES } from '@/constants/storage'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { cloudEnabled, cloudUnabledTip, commonEnabled, validateRescueMode } from '../utils'

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
    tableOverviewIndexs: {
      type: Array,
    },
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    const filter = {}
    if (this.$route.query.id) {
      filter.id = [this.$route.query.id]
    }
    if (this.$route.query.status) {
      filter.status = this.$route.query.status
    }

    const pci_model_types = this.$store.getters.capability?.pci_model_types || []
    let devTypes = pci_model_types.map(item => {
      return { key: item.dev_type, label: item.dev_type }
    })
    devTypes = _.unionWith(devTypes, _.isEqual)

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
        hiddenField: 'ips',
      },
      status: getStatusFilter('server'),
      power_states: getStatusFilter({ title: this.$t('compute.power_states'), statusModule: 'server', field: 'power_states' }),
      os_dist: {
        label: this.$t('table.title.os'),
        dropdown: true,
        multiple: true,
        distinctField: {
          type: 'extra_field',
          key: 'os_dist',
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
        multiple: true,
        hiddenField: 'is_gpu',
        items: [
          { label: this.$t('compute.text_291', [this.$t('dictionary.server')]), key: 'normal' },
          { label: `USB${this.$t('dictionary.server')}`, key: 'usb' },
          { label: this.$t('compute.backup'), key: 'backup' },
          { label: this.$t('compute.trans_device_server'), key: 'gpu' },
          ...devTypes,
        ],
      },
      region: getRegionFilter(),
      zone_ids: getZoneFilter(),
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
        ctx: this,
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
        hiddenColumns: ['is_gpu', 'metadata', 'instance_type', 'os_type', 'vpc', 'host', 'account', 'created_at', 'macs', 'os_arch', 'vcpu_count', 'vmem_size', 'disk', 'power_states'],
        autoHiddenFilterKey: 'server_hidden_columns',
        fetchDataCb: (res) => {
          const { totals = {} } = res.data
          this.$emit('resStatisticsChange', totals)
        },
      }),
      groupActions: [
        // 新建
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
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_create') || this.hiddenActions.includes('create'),
        },
        // 开机
        {
          label: this.$t('compute.text_272'),
          permission: 'server_perform_start',
          action: () => {
            this.createDialog('VmStartDialog', {
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
              ret.validate = this.list.selectedItems.every(item => item.status === 'ready')
              return ret
            })
            return ret
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start'),
        },
        // 关机
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
              ret.validate = this.list.selectedItems.every(item => item.status === 'running' || item.status === 'stop_fail')
              return ret
            })
            return ret
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_stop'),
        },
        // 重启
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
            const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems, [typeClouds.hypervisorMap.bingocloud.key, typeClouds.hypervisorMap.sangfor.key])
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
        // 同步状态
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
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_syncstatus'),
        },
        /* 批量操作 */
        {
          label: this.$t('compute.text_275'),
          actions: () => {
            return [
              {
                // * 实例状态
                label: this.$t('compute.text_353'),
                submenus: [
                  // 挂起
                  {
                    label: this.$t('compute.text_1128'),
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
                      const isAllSupportBrand = this.list.selectedItems.every(item => {
                        return [
                          BRAND_MAP.VMware.key,
                          BRAND_MAP.OneCloud.key,
                        ].includes(item.brand)
                      })
                      const isAllRunning = this.list.selectedItems.every(item => item.status === 'running')
                      if (!isAllSupportBrand) {
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
                    hidden: () => !hasSetupKey(['vmware']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_suspend'),
                  },
                  // 恢复
                  {
                    label: this.$t('compute.text_478'),
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
                      const isAllVMware = this.list.selectedItems.every(item => item.brand === BRAND_MAP.VMware.key || item.brand === BRAND_MAP.OneCloud.key)
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
                    hidden: () => !hasSetupKey(['vmware']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_resume'),
                  },
                  // 进入紧急模式
                  {
                    label: this.$t('compute.start_rescue'),
                    permission: 'server_perform_start_rescue',
                    action: () => {
                      this.createDialog('VmStartRescueDialog', {
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                        refresh: this.refresh,
                      })
                    },
                    meta: () => {
                      const ret = { validate: true }
                      let isAllKVM = true
                      let isRescueMode = false
                      this.list.selectedItems.forEach(item => {
                        if (item.brand !== BRAND_MAP.OneCloud.key) {
                          isAllKVM = false
                        }
                        if (item.rescue_mode === true) {
                          isRescueMode = true
                        }
                      })
                      if (!isAllKVM) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1388')
                        return ret
                      }
                      if (isRescueMode) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.start_rescue.validate_tooltip')
                        return ret
                      }
                      return ret
                    },
                    hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start_rescue'),
                  },
                  // 退出紧急模式
                  {
                    label: this.$t('compute.stop_rescue'),
                    permission: 'server_perform_stop_rescue',
                    action: () => {
                      this.createDialog('VmStopRescueDialog', {
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                        refresh: this.refresh,
                      })
                    },
                    meta: () => {
                      const ret = { validate: true }
                      let isAllKVM = true
                      let isRescueMode = true
                      this.list.selectedItems.forEach(item => {
                        if (item.brand !== BRAND_MAP.OneCloud.key) {
                          isAllKVM = false
                        }
                        if (item.rescue_mode !== true) {
                          isRescueMode = false
                        }
                      })
                      if (!isAllKVM) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1388')
                        return ret
                      }
                      if (!isRescueMode) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.stop_rescue.validate_tooltip')
                        return ret
                      }
                      return ret
                    },
                    hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_stop_rescue'),
                  },
                  // 推送配置
                  {
                    label: this.$t('compute.sync_config'),
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
                      const isAllKVM = this.list.selectedItems.every(item => item.brand === BRAND_MAP.OneCloud.key)
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
                // * 属性设置
                label: this.$t('compute.text_356'),
                submenus: [
                  // 修改属性
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      const isOneCloud = this.list.selectedItems.every(item => item.brand === 'OneCloud')
                      return {
                        validate: isOneCloud,
                        tooltip: !isOneCloud && this.$t('compute.text_355'),
                      }
                    },
                    hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_update'),
                  },
                  // 更改项目
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
                      let ret = {
                        validate: true,
                        tooltip: null,
                      }
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      if (!this.isAdminMode && !this.isDomainMode) {
                        ret.validate = false
                        ret.tooltip = `仅系统或${this.$t('dictionary.domain')}管理员支持该操作`
                        return ret
                      }
                      // 某些云不支持
                      const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems, [typeClouds.hypervisorMap.zettakit.key, typeClouds.hypervisorMap.uis.key])
                      if (!unenableCloudCheck.validate) {
                        ret = unenableCloudCheck
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
                  // 到期释放
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      // 包年包月机器，不支持此操作
                      const isSomePrepaid = this.list.selectedItems.some((item) => {
                        return item.billing_type === 'prepaid'
                      })
                      if (isSomePrepaid) {
                        ret.tooltip = this.$t('compute.text_285')
                        return ret
                      }
                      // 某些云不支持
                      const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems, [typeClouds.hypervisorMap.bingocloud.key, typeClouds.hypervisorMap.sangfor.key, typeClouds.hypervisorMap.zettakit.key, typeClouds.hypervisorMap.uis.key])
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
                  // 主机克隆
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      for (const obj of this.list.selectedItems) {
                        if (obj.brand !== BRAND_MAP.OneCloud.key) {
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
                  // 续费
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
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
                    hidden: () => !hasSetupKey(['aliyun', 'qcloud', 'huawei', 'ucloud', 'ecloud', 'jdcloud', 'ctyun']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_Renew'),
                  },
                  // 自动续费设置
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
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
                  // 更改计费模式
                  {
                    label: this.$t('compute.change_billing_type'),
                    permission: 'server_perform_change_billing_type',
                    action: () => {
                      this.createDialog('VmChangeBillingTypeDialog', {
                        steadyStatus: ['running', 'ready'],
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                        refresh: this.refresh,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
                      }
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      this.list.selectedItems.map(obj => {
                        if (obj.brand !== BRAND_MAP.Aliyun.key && obj.brand !== BRAND_MAP.Qcloud.key) {
                          ret.tooltip = this.$t('compute.text_473', [PROVIDER_MAP[obj.provider].label])
                        }
                      })
                      if (!ret.tooltip) {
                        ret.validate = true
                      }
                      return ret
                    },
                    hidden: () => !(hasSetupKey(['aliyun', 'qcloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_change_billing_type'),
                  },
                  // 编辑标签
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      // 某些云不支持
                      const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems)
                      if (!unenableCloudCheck.validate) {
                        ret = unenableCloudCheck
                        return ret
                      }
                      return ret
                    },
                  },
                ],
              },
              {
                // * 配置修改
                label: this.$t('compute.group_action.update_config'),
                submenus: [
                  // 重装系统
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      const isSameStopCharging = this.list.selectedItems.some((item) => { return item.shutdown_mode === 'stop_charging' && item.status === 'ready' })
                      if (isSameStopCharging) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.server.shutdown_mode.tooltip')
                        return ret
                      }

                      // same cpu arch
                      if (!this.isSameArch) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.vminstance.actions.adjust_config.cpu_arch.tips')
                        return ret
                      }

                      if (this.isSameHyper) {
                        ret.validate = cloudEnabled('rebuildRoot', this.list.selectedItems)
                        ret.tooltip = cloudUnabledTip('rebuildRoot', this.list.selectedItems)
                        return ret
                      }

                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_rebuild_root'),
                  },
                  // 调整配置
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
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
                        const isSameStopCharging = this.list.selectedItems.some((item) => { return item.shutdown_mode === 'stop_charging' && item.status === 'ready' })
                        if (isSameStopCharging) {
                          ret.validate = false
                          ret.tooltip = this.$t('compute.server.shutdown_mode.tooltip')
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
                  // 设置透传设备
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      const isAllIdc = this.list.selectedItems.every((item) => {
                        return findPlatform(item.hypervisor, 'hypervisor') === SERVER_TYPE.idc
                      })
                      const isOk = this.list.selectedItems.every((item) => { return ['running', 'ready'].includes(item.status) })
                      if (!isOk) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1126')
                        return ret
                      }
                      // 某些云不支持
                      const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems, [typeClouds.hypervisorMap.bingocloud.key, 'esxi', typeClouds.hypervisorMap.zettakit.key, typeClouds.hypervisorMap.uis.key])
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
                ],
              },
              {
                // * 密码密钥
                label: this.$t('compute.text_360'),
                submenus: [
                  // 重置密码
                  {
                    label: this.$t('compute.text_276'),
                    permission: 'server_perform_set_password',
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
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
                      let ret = {
                        validate: true,
                        tooltip: null,
                      }
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      // 某些云不支持
                      const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems, [typeClouds.hypervisorMap.sangfor.key, typeClouds.hypervisorMap.zettakit.key, typeClouds.hypervisorMap.uis.key])
                      if (!unenableCloudCheck.validate) {
                        ret = unenableCloudCheck
                        return ret
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
                      let ret = {
                        validate: true,
                        tooltip: null,
                      }
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      // 某些云不支持
                      const unenableCloudCheck = this.hasSomeCloud(this.list.selectedItems, [typeClouds.hypervisorMap.sangfor.key, typeClouds.hypervisorMap.zettakit.key, typeClouds.hypervisorMap.uis.key])
                      if (!unenableCloudCheck.validate) {
                        ret = unenableCloudCheck
                        return ret
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
                // * 网络安全
                label: this.$t('compute.text_1290'),
                submenus: [
                  // 关联安全组
                  // {
                  //   label: this.$t('compute.text_1116'),
                  //   permission: 'server_perform_add_secgroup',
                  //   action: () => {
                  //     this.createDialog('VmSetSecgroupDialog', {
                  //       vm: this,
                  //       data: this.list.selectedItems,
                  //       columns: this.columns,
                  //       onManager: this.onManager,
                  //     })
                  //   },
                  //   meta: () => {
                  //     const ret = {
                  //       validate: cloudEnabled('assignSecgroup', this.list.selectedItems),
                  //       tooltip: cloudUnabledTip('assignSecgroup', this.list.selectedItems),
                  //     }
                  //     return ret
                  //   },
                  //   hidden: () => !(hasSetupKey(['onestack', 'onecloud', 'public', 'openstack', 'dstack', 'zstack', 'apsara', 'cloudpods', 'hcso', 'hcs'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_secgroup'),
                  // },
                  // 公网IP转EIP
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
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
                  // 设置源/目标检查
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
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      const isAllOneCloud = this.list.selectedItems.every((item) => { return item.brand === BRAND_MAP.OneCloud.key })
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
                // * 高可用
                label: this.$t('compute.text_1295'),
                submenus: [
                  // 迁移
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
                      const ret = { validate: true, tooltip: null }
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      // 运行中、关机、状态未知
                      const statusSet = new Set()
                      const brandSet = new Set()
                      this.list.selectedItems.forEach(item => {
                        statusSet.add(item.status)
                        brandSet.add(item.brand)
                      })
                      if (!this.isAdminMode && !this.isDomainMode) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.tooltip.check_domain_permission')
                        return ret
                      }
                      if (statusSet.size > 1) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.tooltip.check_some_status_transfer')
                        return ret
                      }
                      const isStatusOk = [...statusSet].every((status) => {
                        return ['running', 'ready'].includes(status)
                      })
                      if (!isStatusOk) {
                        ret.tooltip = this.$t('compute.tooltip.check_status_transfer')
                        ret.validate = false
                        return ret
                      }
                      const isBackupHost = this.list.selectedItems.some((item) => item.backup_host_id)
                      if (isBackupHost) {
                        ret.tooltip = this.$t('compute.tooltip.check_backup_host_transfer')
                        ret.validate = false
                        return ret
                      }
                      const isGpu = this.list.selectedItems.some((item) => item.is_gpu)
                      if (isGpu) {
                        ret.tooltip = this.$t('compute.tooltip.check_gpu_transfer')
                        ret.validate = false
                        return ret
                      }
                      const isCdrom = this.list.selectedItems.some((item) => item.cdrom)
                      if (isCdrom) {
                        ret.tooltip = this.$t('compute.tooltip.check_cdrom_transfer')
                        ret.validate = false
                        return ret
                      }
                      if (brandSet.size > 1) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.v2vtransfer.same_brand')
                        return ret
                      }
                      ret.validate = cloudEnabled('transfer', this.list.selectedItems)
                      ret.tooltip = cloudUnabledTip('transfer', this.list.selectedItems)
                      return ret
                    },
                    hidden: () => !(hasSetupKey(['onecloud', 'openstack', 'vmware'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_transfer'),
                  },
                  // V2V迁移
                  {
                    label: this.$t('compute.v2vtransfer.label'),
                    permission: 'server_perform_migrate',
                    action: () => {
                      this.createDialog('VmV2vTransferDialog', {
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                        successCallback: this.refresh,
                      })
                    },
                    meta: () => {
                      const ret = { validate: true, tooltip: null }
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      const statusSet = new Set()
                      const brandSet = new Set()
                      const backupHostSet = new Set()
                      let isIpEmpty = false

                      if (!this.isAdminMode && !this.isDomainMode) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.tooltip.check_domain_permission')
                        return ret
                      }

                      this.list.selectedItems.forEach((item) => {
                        statusSet.add(item.status)
                        brandSet.add(item.brand)
                        if (item.backup_host_id) {
                          backupHostSet.add(item.backup_host_id)
                        }
                        if (!item.ips) {
                          isIpEmpty = true
                        }
                      })

                      if (statusSet.size > 1 || !statusSet.has('ready')) {
                        ret.tooltip = this.$t('compute.tooltip.check_ready_status_transfer')
                        ret.validate = false
                        return ret
                      }
                      if (brandSet.size > 1) {
                        ret.tooltip = this.$t('compute.v2vtransfer.same_brand')
                        ret.validate = false
                        return ret
                      } else {
                        if (!brandSet.has(BRAND_MAP.Cloudpods.key) &&
                          !brandSet.has(BRAND_MAP.VMware.key)) {
                          ret.tooltip = this.$t('compute.brand_support', [`${BRAND_MAP.Cloudpods.label},${BRAND_MAP.VMware.label}`])
                          ret.validate = false
                          return ret
                        }
                      }
                      if (backupHostSet.size > 0) {
                        ret.tooltip = this.$t('compute.tooltip.check_backup_host_transfer')
                        ret.validate = false
                        return ret
                      }
                      if (isIpEmpty) {
                        ret.tooltip = this.$t('compute.fill_ips_tooltip')
                        ret.validate = false
                        return ret
                      }

                      ret.validate = cloudEnabled('v2vTransfer', this.list.selectedItems)
                      ret.tooltip = cloudUnabledTip('v2vTransfer', this.list.selectedItems)
                      return ret
                    },
                    hidden: () => !(hasSetupKey(['vmware', 'cloudpods'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_transfer'),
                  },
                  // 快速恢复
                  {
                    label: this.$t('compute.server.quick.recovery'),
                    action: () => {
                      this.createDialog('VmQuickRecoveryDialog', {
                        data: this.list.selectedItems,
                        columns: this.columns,
                        onManager: this.onManager,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: true,
                        tooltip: '',
                      }
                      const rescueModeValid = validateRescueMode(this.list.selectedItems)
                      if (!rescueModeValid.validate) return rescueModeValid
                      const isAllOneCloud = this.list.selectedItems.every((item) => { return item.brand === BRAND_MAP.OneCloud.key })
                      if (!isAllOneCloud) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_1125')
                        return ret
                      }
                      const isAllHostOffline = this.list.selectedItems.every((item) => { return item.host_service_status === 'offline' })
                      if (!isAllHostOffline) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.quick.recovery.validate.host_status_tooltip')
                        return ret
                      }
                      const allStorages = R.flatten(this.list.selectedItems.map(item => item.disks_info || []))
                      const isAllKVMShareStorages = allStorages.every(item => KVM_SHARE_STORAGES.includes(item.storage_type))
                      if (!isAllKVMShareStorages) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.quick.recovery.validate.host_status_tooltip')
                        return ret
                      }
                      return ret
                    },
                    hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_migrate'),
                  },
                ],
              },
              {
                // * 删除
                label: this.$t('compute.perform_delete'),
                submenus: [
                  // 设置删除保护
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
                  // 删除
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
      if (this.list.selectedItems[0] && (this.list.selectedItems[0].hypervisor.toLowerCase() === 'hcso' || this.list.selectedItems[0].hypervisor.toLowerCase() === 'hcs')) {
        const instancetype = this.list.selectedItems[0].instance_type || ''
        const isArm = instancetype.startsWith('k')
        return this.list.selectedItems.every(item => item.instance_type && item.instance_type.startsWith('k') === isArm)
      }
      return true
    },
    showActions () {
      return !this.$isScopedPolicyMenuHidden('server_hidden_columns.perform_action')
    },
    exportDataOptions () {
      const ret = {
        isOpenExportUsernamePassword: false,
        downloadType: 'local',
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.external_id'), key: 'external_id' },
        ],
        fixedItems: [
          { key: 'metadata.os_distribution', label: this.$t('table.title.os') },
          { key: 'disk', label: this.$t('table.title.disk') + '(M)' },
          { key: 'vmem_size', label: this.$t('table.title.vmem_size') + '(M)' },
          { key: 'eip', title: this.$t('common.eip') },
          { key: 'ips', title: 'IP' },
          { key: 'is_gpu', title: `${this.$t('table.title.type')}(${this.$t('compute.text_113')}${this.$t('dictionary.server')})` },
        ],
        hiddenFields: ['os_dist', 'elastic_ip', 'ip'],
        async beforeExport () {
          const checkOpenExportUsernamePassword = async () => {
            try {
              const configM = new Manager('services', 'v1')
              const servicesRes = await configM.list({ params: { type: 'compute_v2' } })
              const serviceId = servicesRes.data.data?.[0]?.id
              const configData = await configM.getSpecific({ id: serviceId, spec: 'config' })
              const { enable_export_username_password = false } = configData.data?.config?.default
              ret.isOpenExportUsernamePassword = enable_export_username_password
              return enable_export_username_password
            } catch (error) {
              console.log('fetch compute_v2 service config error!!!')
            }
          }

          const isOpenExportUsernamePassword = await checkOpenExportUsernamePassword()
          ret.isOpenExportUsernamePassword = isOpenExportUsernamePassword

          ret.items.forEach(item => {
            if (item.field === 'extra_user') {
              item.hidden = !isOpenExportUsernamePassword
            }
            if (item.field === 'extra_password') {
              item.hidden = !isOpenExportUsernamePassword
            }
          })
        },
        async callback (data, selectedExportKeys) {
          if (!ret.isOpenExportUsernamePassword) {
            return data
          }
          if (!selectedExportKeys.includes('extra_user') && !selectedExportKeys.includes('extra_password')) {
            return data
          }

          const manager = new Manager('servers')
          const allPromise = data.map(async item => {
            let username = ''
            let password = ''

            try {
              const { data } = await manager.objectRpc({
                methodname: 'GetLoginInfo',
                objId: item.id,
              })
              username = data.username
              password = data.password
            } catch (error) {
              console.log(`server: ${item.id}, login info fetch error!!!`)
            }

            return Promise.resolve({ id: item.id, username, password })
          })

          const results = Promise.all(allPromise).then(values => {
            const realData = data.map(item => {
              const curObj = values.find(v => v.id === item.id)
              return {
                ...item,
                extra_user: curObj.username,
                extra_password: curObj.password,
              }
            })
            return realData
          })
          return results
        },
      }

      this.columns.map(col => {
        if (col.field === 'ips') {
          ret.items.push(getIpsTableColumn({ field: 'elastic_ip', title: this.$t('common.eip'), vm: this, onlyElastic: true }))
          ret.items.push(getIpsTableColumn({ field: 'ip', title: 'IP', vm: this, noElastic: true }))
        } else if (!(col.hidden && col.hidden()) && col.field !== 'password') {
          const item = {
            field: col.field,
            title: col.title || col.label,
            formatter: col.formatter,
          }
          if (col.field === 'vmem_size') {
            item.title = `${item.title}(G)`
            item.formatter = ({ row }) => {
              if (row.vmem_size) {
                const config = (row.vmem_size / 1024)
                return config
              }
              return ''
            }
          }
          if (col.field === 'disk') {
            item.title = `${item.title}(G)`
            item.formatter = ({ row }) => {
              if (row.disk) {
                const size = sizeToDesignatedUnit(row.disk, 'M', 'G', 1024, false, 2)
                return size
              }
              return ''
            }
          }
          ret.items.push(item)
        } else if (col.field === 'password') {
          ret.items.push({ field: 'extra_user', title: this.$t('compute.text_566') })
          ret.items.push({ field: 'extra_password', title: this.$t('common_328') })
        }

        if (col.field === 'region') {
          ret.items.push({ field: 'zone', title: this.$t('compute.text_270') })
        }
      })
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
    // this.$bus.$on('VMInstanceListRefresh', args => {
    //   this.list.resetRefresh()
    // }, this)
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        filter: 'hypervisor.notin(baremetal,container,pod)',
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'VmInstanceSidePage', {
        id: row.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.server).flat(),
      }, {
        list: this.list,
        tab,
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
