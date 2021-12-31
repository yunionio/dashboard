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
            validate: false,
            tooltip: null,
          }
          ret.validate = true
          return ret
        },
        hidden: this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.instancegroup_detach_network'),
      },
    ]
  },
}
