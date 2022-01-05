import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('compute.text_483', [this.$t('dictionary.server')]),
        permission: 'instancegroups_perform_bind_guests',
        action: (obj) => {
          this.createDialog('InstanceGroupBindServerDialog', {
            columns: this.columns,
            data: [obj],
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: (obj) => ({
          validate: obj.enabled,
          tooltip: !obj.enabled ? i18n.t('compute.text_717') : null,
        }),
      },
      {
        label: i18n.t('compute.text_352'),
        actions: obj => {
          return [
            ...getEnabledSwitchActions(this, obj, ['instancegroups_perform_enable', 'instancegroups_perform_disable']),
            {
              label: this.$t('compute.create_vip'),
              action: () => {
                this.createDialog('InstanceGroupAddVipNetworkDialog', {
                  title: this.$t('compute.create_vip'),
                  data: [obj],
                  columns: this.columns,
                  resId: obj.Id,
                  refresh: this.refresh,
                  total: obj.vips.length,
                })
              },
              meta: () => {
                let tooltip = null
                if (!obj.network_id) {
                  tooltip = this.$t('compute.instance_group_no_network_id')
                }
                if (obj.vips.length >= 1) {
                  tooltip = this.$t('compute.too_many_instance_group_vip')
                }
                return {
                  validate: (obj.network_id !== '' && obj.vips.length < 1),
                  tooltip,
                }
              },
              // hidden: this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_add_network_card'),
            },
            {
              label: i18n.t('compute.text_1179'),
              permission: 'instancegroup_perform_associate_eip',
              action: () => {
                this.createDialog('InstanceGroupBindEipDialog', {
                  data: [obj],
                  columns: this.columns,
                  refresh: this.refresh,
                  onManager: this.onManager,
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: null,
                }
                if (obj.vips.length > 0 && obj.eip === '') {
                  ret.validate = true
                } else if (obj.vips.length === 0) {
                  ret.tooltip = this.$t('compute.prompt_empty_instance_group_vip')
                } else if (obj.eip !== '') {
                  ret.tooltip = this.$t('compute.prompt_already_associate_eip')
                }
                return ret
              },
              // hidden: () => !(hasSetupKey(['onestack', 'onecloud', 'public', 'openstack', 'dstack', 'zstack', 'apsara', 'cloudpods', 'hcso'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_bind_elastic_public_ip'),
            },
            // 解绑弹性公网IP
            {
              label: i18n.t('compute.text_1264'),
              permission: 'instancegroup_perform_dissociate_eip',
              action: () => {
                this.createDialog('InstanceGroupUnbindEipDialog', {
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
                if (obj.eip !== '') {
                  ret.validate = true
                } else {
                  ret.tooltip = this.$t('compute.prompt_no_associate_eip')
                }
                return ret
              },
              // hidden: () => !(hasSetupKey(['onestack', 'onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.instancegroup_perform_unbind_elastic_public_ip'),
            },
            {
              label: i18n.t('compute.perform_delete'),
              permission: 'instancegroups_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('compute.text_700', [this.$t('dictionary.instancegroup')]),
                  name: this.$t('dictionary.instancegroup'),
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}
