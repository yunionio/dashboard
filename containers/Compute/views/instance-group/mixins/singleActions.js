import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('compute.text_1028_1'),
        permission: 'instancegroups_perform_bind_guests',
        action: (obj) => {
          this.sidePageTriggerHandle(this, 'InstanceGroupSidePage', {
            id: obj.id,
            resource: 'instancegroups',
          }, { tab: 'associated-instances' })
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
              permission: 'instancegroups_perform_attach_network',
              action: () => {
                this.createDialog('InstanceGroupAddVipNetworkDialog', {
                  title: this.$t('compute.create_vip'),
                  data: [obj],
                  columns: this.columns,
                  resId: obj.Id,
                  refresh: this.refresh,
                  total: obj.vips && obj.vips.length,
                })
              },
              meta: () => {
                const ret = {
                  validate: true,
                }
                if (!obj.network_id) {
                  ret.validate = false
                  ret.tooltip = this.$t('compute.instance_group_no_network_id')
                } else if (obj.vips && obj.vips.length >= 1) {
                  ret.validate = false
                  ret.tooltip = this.$t('compute.too_many_instance_group_vip')
                }
                return ret
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
                  validate: true,
                }
                if (!obj.vips || obj.vips.length === 0) {
                  ret.validate = false
                  ret.tooltip = this.$t('compute.prompt_empty_instance_group_vip')
                } else if (obj.vip_eip) {
                  ret.validate = false
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
                  validate: true,
                }
                if (!obj.vip_eip) {
                  ret.validate = false
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
