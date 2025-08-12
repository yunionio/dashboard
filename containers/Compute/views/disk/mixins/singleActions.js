import { mapGetters } from 'vuex'
import { diskResizeConfig, diskCreateSnapshotConfig } from '@Compute/views/disk/utils'
import i18n from '@/locales'
import { BRAND_MAP, PROVIDER_MAP, HYPERVISORS_MAP } from '@/constants'
import { getDisabledProvidersActionMeta } from '@/utils/common/hypervisor'
import { hasSetupKey } from '@/utils/auth'
const supportShpolcyBrand = ['OneCloud', 'Qcloud', 'Aliyun']

export default {
  computed: {
    ...mapGetters(['isAdminMode']),
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.disk_perform_resize'),
        permission: 'disks_perform_resize',
        action: obj => {
          this.createDialog('DiskCapacityUpdateDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          const provider = obj.provider?.toLowerCase()
          if (diskResizeConfig[provider]) {
            return {
              validate: diskResizeConfig[provider](obj).validate,
              tooltip: diskResizeConfig[provider](obj).tooltip,
            }
          }
          return {
            validate: true,
          }
        },
        extraMeta: obj => {
          return getDisabledProvidersActionMeta({
            row: obj,
            disabledProviders: ['BingoCloud', 'SangFor'],
          })
        },
        hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_perform_resize'),
      },
      {
        label: i18n.t('compute.text_352'),
        actions: obj => {
          return [
            {
              label: i18n.t('compute.disk_perform_attach'),
              permission: 'disks_perform_attachdisk',
              action: () => {
                this.createDialog('DiskMountUpdateDialog', {
                  data: [obj],
                  columns: this.columns,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: '',
                }
                if (obj.cloud_env === 'onpremise' || obj.cloud_env === 'private' || obj.cloud_env === 'public') {
                  // if (obj.storage_type === 'local') {
                  //   ret.tooltip = i18n.t('compute.text_442')
                  //   return ret
                  // }
                  ret.validate = !obj.guest && obj.status === 'ready'
                  if (obj.guest) {
                    ret.tooltip = i18n.t('compute.text_443')
                  } else {
                    if (obj.status === 'ready') {
                      ret.tooltip = ''
                    } else {
                      ret.tooltip = i18n.t('compute.text_444')
                    }
                  }
                  return ret
                }
                ret.validate = true
                return ret
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud', 'SangFor'],
                })
              },
              hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_perform_attach'),
            },
            {
              label: i18n.t('compute.disk_perform_detach'),
              permission: 'disks_perform_detachdisk',
              action: () => {
                this.createDialog('DiskUnMountUpdateDialog', {
                  data: [obj],
                  columns: this.columns,
                  list: this.list,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                if (obj.status === 'unknown') {
                  return {
                    validate: true,
                    tooltip: '',
                  }
                }
                if (obj.brand) {
                  const brand = obj.brand.toLowerCase()
                  if (brand === 'vmware' && obj.disk_type === 'data') {
                    return {
                      validate: false,
                      tooltip: i18n.t('compute.text_1287', [BRAND_MAP[obj.brand].label]),
                    }
                  }
                }
                if (!obj.guest) {
                  return {
                    validate: !!obj.guest,
                    tooltip: i18n.t('compute.text_445'),
                  }
                }
                // if (obj.cloud_env === 'onpremise' && obj.storage_type === 'local') {
                //   return {
                //     validate: false,
                //     tooltip: i18n.t('compute.text_446'),
                //   }
                // }
                if (obj.guests && obj.guests.length > 1) {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.disk_mount_mulitple_guest'),
                  }
                }
                // if (obj.guests && obj.guests.length === 1 && obj.guests[0].index === 0 && obj.guests[0].hyppervisor === '') {
                if (obj.disk_type === 'sys') {
                  // system disk
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_447'),
                  }
                }
                if (obj.portable && obj.portable === false) {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_448'),
                  }
                }
                return {
                  validate: true,
                  tooltip: '',
                }
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud', 'SangFor'],
                })
              },
              hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_perform_detach'),
            },
            {
              label: i18n.t('compute.disk_perform_create_snapshot'),
              permission: 'snapshots_create',
              action: () => {
                this.createDialog('DiskCreateSnapshotDialog', {
                  data: [obj],
                  columns: this.columns,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const ret = { validate: true }
                const provider = obj.provider?.toLowerCase()
                if (provider) {
                  const { validate, tooltip } = diskCreateSnapshotConfig[provider](obj)
                  ret.validate = validate
                  ret.tooltip = tooltip
                }
                return ret
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud', 'SangFor'],
                })
              },
              hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_perform_create_snapshot'),
            },
            {
              label: i18n.t('compute.vminstance.change_disk_storage'),
              action: () => {
                this.createDialog('DiskChangeBlockStorageDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const guestStatus = ['running', 'ready']
                const ret = {
                  validate: true,
                }
                if (obj.brand !== BRAND_MAP.OneCloud.key) {
                  ret.validate = false
                  ret.tooltip = i18n.t('compute.text_1287', [BRAND_MAP[obj.brand]?.label])
                }
                if (this.isProjectMode) {
                  ret.tooltip = this.$t('compute.text_1279', [this.$t('dictionary.domain')])
                  ret.validate = false
                }
                if (!obj.guest) {
                  ret.validate = false
                } else {
                  if (!guestStatus.includes(obj.guest_status)) {
                    ret.validate = false
                  }
                }
                return ret
              },
              hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_perform_change_disk_storage'),
            },
            {
              label: i18n.t('compute.create_disk_backup'),
              action: () => {
                this.createDialog('DiskCreateBackupDialog', {
                  data: [obj],
                  columns: this.columns,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const guestStatus = ['running', 'ready']
                if (obj.cloud_env === 'public') {
                  return {
                    validate: false,
                  }
                }
                if (obj.guest && !guestStatus.includes(obj.guest_status)) {
                  return {
                    validate: false,
                  }
                }
                if (!obj.guest && obj.storage_type === 'local') {
                  return {
                    validate: false,
                    tooltip: '',
                  }
                }
                return {
                  validate: true,
                  tooltip: '',
                }
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud', 'VolcEngine', 'SangFor', 'ZettaKit', 'UIS'],
                })
              },
              hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_perform_create_backup'),
            },
            {
              label: i18n.t('compute.disk_perform_setup_snapshot_policy'),
              permission: 'snapshotpolicy_delete',
              action: () => {
                this.createDialog('DiskSetSnapshotDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  refresh: this.refresh,
                  onManager: this.onManager,
                })
              },
              meta: () => {
                if (obj.status !== 'ready') {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_449'),
                  }
                }
                if (obj.brand) {
                  const brand = obj.brand.toLowerCase()
                  if (brand === 'vmware') {
                    return {
                      validate: false,
                      tooltip: i18n.t('compute.text_450'),
                    }
                  }
                  if (brand === 'ctyun') {
                    return {
                      validate: false,
                      tooltip: i18n.t('compute.text_451'),
                    }
                  }
                  if (brand === 'openstack') {
                    if (obj.storage_type !== 'local' && obj.storage_type !== 'iscsi') {
                      return {
                        validate: false,
                        tooltip: i18n.t('compute.text_452'),
                      }
                    }
                  } else {
                    if (!obj.guest_count) {
                      return {
                        validate: false,
                        tooltip: i18n.t('compute.text_453'),
                      }
                    }
                  }
                  if (brand === 'ucloud') {
                    if (obj.storage_type !== 'CLOUD_NORMAL') {
                      return {
                        validate: false,
                        tooltip: i18n.t('compute.text_454'),
                      }
                    }
                  }
                }
                if (obj.guest_status !== 'running' && obj.guest_status !== 'ready') {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_455'),
                  }
                }
                if (!supportShpolcyBrand.includes(obj.brand)) {
                  const newSupportShpolcyBrand = supportShpolcyBrand.map(v => {
                    if (v === 'OneCloud') {
                      return i18n.t('brand')
                    }
                    return v
                  })
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_456', [newSupportShpolcyBrand.join('、')]),
                  }
                }
                if (obj.snapshotpolicy_status === 'deleting' || obj.snapshotpolicy_status === 'init') {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_457'),
                  }
                }
                return {
                  validate: true,
                }
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud', 'SangFor', 'ZettaKit', 'UIS'],
                })
              },
              hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_perform_setup_snapshot_policy'),
            },
            {
              label: i18n.t('compute.disk_set_auto_reset'),
              permission: 'disks_perform_bind_snapshotpolicy,disks_perform_unbind_snapshotpolicy',
              action: () => {
                this.createDialog('DiskSetAutoResetDialog', {
                  vm: this,
                  data: [obj],
                  onManager: this.onManager,
                  columns: this.columns,
                  refresh: this.refresh,
                })
              },
              meta: (obj) => {
                const ret = {
                  validate: false,
                  tooltip: this.$t('cloudenv.brand_action_deny'),
                }
                if (obj.guest_status !== 'ready') {
                  ret.tooltip = i18n.t('compute.text_1308')
                }
                if (obj.provider === HYPERVISORS_MAP.kvm.brand && obj.guest_status === 'ready') {
                  ret.validate = true
                  ret.tooltip = ''
                }
                return ret
              },
              hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_perform_auto_reset'),
            },
            {
              label: i18n.t('compute.driver.update'),
              permission: 'disks_update',
              action: () => {
                this.createDialog('DiskDriverUpdateDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  resource: 'disks',
                  name: i18n.t('compute.text_100'),
                })
              },
              meta: () => {
                const ret = {
                  validate: true,
                }
                if (!(obj.brand === HYPERVISORS_MAP.kvm.brand)) {
                  ret.validate = false
                  ret.tooltip = i18n.t('compute.text_1388')
                }
                if (!obj.guest) {
                  ret.validate = false
                  ret.tooltip = i18n.t('compute.disk_update_driver_prompt')
                }
                return ret
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud', 'SangFor', 'ZettaKit', 'UIS'],
                })
              },
              hidden: () => !this.isAdminMode,
            },
            {
              label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
              permission: 'disks_perform_public',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  resource: 'disks',
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: '',
                }
                if (this.isProjectMode) {
                  ret.tooltip = this.$t('compute.text_1279', [this.$t('dictionary.domain')])
                  return ret
                }
                return {
                  validate: obj.guest_count < 1,
                  tooltip: obj.guest ? i18n.t('compute.text_458', [i18n.t('dictionary.project')]) : '',
                }
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud', 'SangFor', 'ZettaKit', 'UIS'],
                })
              },
              hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_perform_change_project'),
            },
            {
              label: i18n.t('compute.perform_sync_status'),
              permission: 'disks_perform_syncstatus',
              action: () => {
                this.onManager('performAction', {
                  steadyStatus: ['running', 'ready'],
                  id: obj.id,
                  managerArgs: {
                    action: 'syncstatus',
                  },
                })
              },
              meta: () => {
                var ret = {
                  validate: true,
                  tooltip: '',
                }
                if (obj.provider === PROVIDER_MAP.VMware.key) {
                  ret.validate = false
                  ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[obj.provider].label])
                  return ret
                }
                if (obj.provider === PROVIDER_MAP.SangFor.key) {
                  ret.validate = false
                  ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[obj.provider].label])
                  return ret
                }
                return ret
              },
              hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_perform_syncstatus'),
            },
            {
              label: i18n.t('compute.change_billing_type'),
              permission: 'disk_perform_change_billing_type',
              action: () => {
                this.createDialog('DiskChangeBillingTypeDialog', {
                  steadyStatus: ['running', 'ready'],
                  data: [obj],
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
                if (obj.brand !== BRAND_MAP.Aliyun.key) {
                  ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[obj.provider].label])
                  return ret
                }
                if (obj.status !== 'ready') {
                  ret.validate = false
                  ret.tooltip = i18n.t('compute.text_1048')
                  return ret
                }
                if (!obj.guest_count) {
                  ret.validate = false
                  ret.tooltip = i18n.t('compute.text_453')
                  return ret
                }
                if (obj.disk_type === 'sys') {
                  ret.validate = false
                  ret.tooltip = i18n.t('compute.sys_disk_disable_action')
                  return ret
                }
                if (obj.billing_type === 'postpaid' && obj.guest_billing_type === 'postpaid') {
                  ret.validate = false
                  ret.tooltip = i18n.t('compute.postpaid_disk_change_billing_type_tip')
                  return ret
                }
                ret.validate = true
                return ret
              },
              hidden: () => !(hasSetupKey(['aliyun'])) || this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_perform_change_billing_type'),
            },
            {
              label: i18n.t('compute.perform_delete'),
              permission: 'disks_delete',
              action: () => {
                this.createDialog('DiskDeleteDialog', {
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('compute.perform_delete'),
                  onManager: this.onManager,
                  success: () => {
                    this.destroySidePage(this.windowId)
                  },
                })
              },
              meta: () => this.$getDeleteResult(obj),
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud', 'SangFor'],
                })
              },
              hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_menus.disk_delete'),
            },
          ]
        },
      },
    ]
  },
}
