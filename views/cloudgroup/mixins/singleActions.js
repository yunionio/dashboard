import {
  getSetPublicAction,
  getDomainChangeOwnerAction,
} from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.text00043'),
        permission: 'cloudgroup_perform_syncstatus',
        action: (obj) => {
          this.onManager('performAction', {
            id: obj.id,
            steadyStatus: ['available'],
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
      },
      {
        label: this.$t('common.text00109'),
        actions: obj => {
          return [
            {
              label: this.$t('cloudenv.cloudgroup_single_action1'),
              permission: 'cloudgroup_perform_set_user',
              action: () => {
                this.createDialog('CloudgroupSetUserDialog', {
                  data: [obj],
                  onManager: this.onManager,
                  columns: this.columns,
                })
              },
              meta: () => {
                return {
                  validate: obj.status === 'available',
                }
              },
            },
            {
              label: this.$t('cloudenv.cloudgroup_single_action2'),
              permission: 'cloudgroup_perform_set_policy',
              action: () => {
                this.createDialog('CloudgroupSetPolicyDialog', {
                  data: [obj],
                  onManager: this.onManager,
                  columns: this.columns,
                  success: () => {
                    this.$bus.$emit('CloudpolicyListForCloudgroupSidepageRefresh')
                  },
                })
              },
              meta: () => {
                return {
                  validate: obj.status === 'available',
                }
              },
            },
            getDomainChangeOwnerAction(this, {
              name: this.$t('dictionary.cloudgroup'),
              resource: 'cloudgroups',
              apiVersion: 'v1',
              hiddenExtra: true,
            }),
            getSetPublicAction(this, {
              name: this.$t('dictionary.cloudgroup'),
              scope: 'domain',
              resource: 'cloudgroups',
              apiVersion: 'v1',
            }),
            {
              label: this.$t('common.delete'),
              permission: 'cloudgroup_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('cloudenv.cloudgroup_delete_tip'),
                  name: this.$t('dictionary.cloudgroup'),
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
