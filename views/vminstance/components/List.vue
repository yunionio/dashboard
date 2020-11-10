<template>
  <page-list
    show-tag-filter
    show-tag-columns
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :before-show-menu="beforeShowMenu" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { cloudEnabled, cloudUnabledTip } from '../utils'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { SERVER_TYPE } from '@Compute/constants'
import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getBrandFilter,
  getStatusFilter,
  getDomainFilter,
  getTenantFilter,
  getAccountFilter,
  getHostFilter,
  getVpcFilter,
} from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'VmInstanceList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
    filterParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
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
        filterOptions: {
          name: getNameFilter(),
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
          host: getHostFilter(),
          gpu: {
            label: this.$t('table.title.type'),
            dropdown: true,
            items: [
              { label: this.$t('compute.text_291', [this.$t('dictionary.server')]), key: false },
              { label: `GPU${this.$t('dictionary.server')}`, key: true },
            ],
          },
          region: {
            label: this.$t('res.region'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'extra_field',
              key: 'region',
            },
          },
          vpc: getVpcFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['is_gpu', 'metadata', 'instance_type', 'os_type', 'vpc', 'host', 'account', 'created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.external_id'), key: 'external_id' },
          { label: this.$t('table.title.name'), key: 'name' },
          { label: 'IP', key: 'ips' },
          { label: 'EIP', key: 'eip' },
          { label: 'CPU', key: 'vcpu_count' },
          { label: this.$t('table.title.memory_mb'), key: 'vmem_size' },
          { label: this.$t('table.title.disk_mb'), key: 'disk' },
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
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.text_18'),
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
                      const isAllVMware = this.list.selectedItems.every(item => item.hypervisor === typeClouds.hypervisorMap.esxi.key)
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
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_suspend'),
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
                      const isAllVMware = this.list.selectedItems.every(item => item.hypervisor === typeClouds.hypervisorMap.esxi.key)
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
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_resume'),
                  },
                  {
                    label: this.$t('compute.text_282'),
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
                ],
              },
              {
                /* 实例设置 */
                label: this.$t('compute.text_356'),
                submenus: [
                  {
                    label: this.$t('compute.text_247'),
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
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_update'),
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
                        const isSomePrepaid = this.list.selectedItems.some((item) => { return item.billing_type === 'prepaid' })
                        if (isSomePrepaid) {
                          ret.validate = false
                          ret.tooltip = this.isAdminMode ? this.$t('compute.text_285') : this.$t('compute.text_1110')
                          return ret
                        }
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
                        return ret
                      }
                      ret.validate = false
                      ret.tooltip = this.$t('compute.text_278')
                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_change_config'),
                  },
                  {
                    label: this.$t('compute.text_279', [this.$t('dictionary.project')]),
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
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: true,
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
                    action: () => {
                      this.createDialog('VmAttachGpuDialog', {
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
                      const isAllReady = this.list.selectedItems.every((item) => { return item.status === 'ready' })
                      const isAllIdc = this.list.selectedItems.every((item) => {
                        return findPlatform(item.hypervisor, 'hypervisor') === SERVER_TYPE.idc
                      })
                      const isAllAdmin = this.list.selectedItems.every((item) => {
                        return this.isAdminMode
                      })
                      // 如果是 VMware提示不支持
                      const isSomeVMware = this.list.selectedItems.some((item) => {
                        return item.hypervisor === 'esxi'
                      })
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
                      if (isSomeVMware) {
                        ret.validate = false
                        ret.tooltip = this.$t('compute.text_450')
                        return ret
                      }
                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_gpu'),
                  },
                  {
                    label: this.$t('compute.text_1117'),
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
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_auto_renewal'),
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
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_secgroup'),
                  },
                  {
                    label: this.$t('compute.text_1121'),
                    action: () => {
                      this.createDialog('VmPublicIpToEipDialog', {
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
                      const isSomeBindEip = this.list.selectedItems.some((item) => { return item.eip && item.eip_mode === 'elastic_ip' })
                      const isAllBindPublicIp = this.list.selectedItems.every((item) => { return item.eip_mode === 'public_ip' })
                      if (isSomeBindEip) {
                        ret.tooltip = this.$t('compute.text_1122')
                        return ret
                      }
                      if (!isAllBindPublicIp) {
                        ret.tooltip = this.$t('compute.text_1123')
                        return ret
                      }
                      ret.validate = cloudEnabled('publicIpToEip', this.list.selectedItems)
                      ret.tooltip = cloudUnabledTip('publicIpToEip', this.list.selectedItems)
                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_public_ip_to_eip'),
                  },
                  {
                    label: this.$t('compute.text_1124'),
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
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_source_check'),
                  },
                ],
              },
              {
                /* 高可用 */
                label: this.$t('compute.text_1295'),
                submenus: [
                  {
                    label: this.$t('compute.text_1127'),
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
                      if (this.list.selectedItems.some(item => item.hypervisor !== 'kvm')) {
                        ret.validate = false
                        return ret
                      }
                      return ret
                    },
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_transfer'),
                  },
                ],
              },
              {
                /* 删除 */
                label: this.$t('compute.text_261'),
                submenus: [
                  disableDeleteAction(this, {
                    name: this.$t('dictionary.server'),
                    hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_set_delete_protection'),
                  }),
                  {
                    label: this.$t('compute.text_261'),
                    permission: 'server_delete',
                    action: () => {
                      this.$openNewWindowForMenuHook('vminstance_configured_callback_address.delete_callback_address', () => {
                        this.createDialog('DeleteVmDialog', {
                          vm: this,
                          data: this.list.selectedItems,
                          columns: this.columns,
                          onManager: this.onManager,
                          title: this.$t('compute.text_261'),
                        })
                      })
                    },
                    meta: () => this.$getDeleteResult(this.list.selectedItems),
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
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
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
    this.initSidePageTab('vm-instance-detail')
    this.list.fetchData()
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
  },
}
</script>
