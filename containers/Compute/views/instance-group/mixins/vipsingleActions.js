import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.instancegroup_detach_network'),
        action: (obj) => {
          this.createDialog('InstanceGroupDetachVipNetworkDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: (obj) => {
          const ret = {
            validate: true,
          }
          if (obj.eip_id) {
            ret.validate = false
            ret.tooltip = this.$t('compute.detach_eip')
          }
          return ret
        },
        hidden: this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.instancegroup_detach_network'),
      },
    ]
  },
}
