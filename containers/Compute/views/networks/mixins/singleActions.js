import { SERVER_TYPE } from '@Compute/constants'
import { findPlatform } from '@/utils/common/hypervisor'
import { PROVIDER_MAP } from '@/constants'
import i18n from '@/locales'

export default {
  created () {
    const type = findPlatform(this.data.hypervisor)
    const isPublic = type === SERVER_TYPE.private
    const isPrivate = type === SERVER_TYPE.public
    this.singleActions = [
      {
        label: i18n.t('compute.text_389'),
        permission: 'server_perform_change_bandwidth',
        action: (obj) => {
          this.$openNewWindowForMenuHook('vminstance_configured_callback_address.modify_bandwidth_callback_address', () => {
            this.createDialog('VmChangeBandwidthDialog', {
              data: [obj],
              columns: this.columns,
              refresh: this.refresh,
              resData: [this.data],
            })
          })
        },
        hidden: this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_edit_bandwidth'),
      },
      {
        label: i18n.t('compute.text_390'),
        permission: 'server_perform_change_ipaddr',
        action: (obj) => {
          this.createDialog('VmChangeIpDialog', {
            data: [obj],
            columns: this.columns,
            zone: this.data.zone_id,
            resId: this.resId,
            hypervisor: this.data.hypervisor,
            refresh: this.refresh,
          })
        },
        meta: (obj) => {
          const ret = {
            validate: false,
            tooltip: null,
          }
          if (this.data?.provider === PROVIDER_MAP.VMware.key) {
            ret.tooltip = this.$t('compute.text_450')
            return ret
          }
          if (isPrivate || isPublic) {
            ret.tooltip = i18n.t('compute.text_391')
            return ret
          }
          ret.validate = true
          return ret
        },
        hidden: this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_change_ip'),
      },
      {
        label: i18n.t('compute.detach_network'),
        permission: 'server_perform_detachnetwork',
        action: (obj) => {
          this.createDialog('VmDetachNetworkDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: (obj) => {
          const ret = {
            validate: false,
            tooltip: null,
          }
          if (isPrivate || isPublic || this.data.hypervisor === 'esxi') {
            ret.tooltip = i18n.t('compute.text_391')
            return ret
          }
          if (!obj.__last) {
            ret.tooltip = i18n.t('compute.server_detach_network.only_last_one')
            return ret
          }
          ret.validate = true
          return ret
        },
        hidden: this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_detach_nic'),
      },
    ]
  },
}
