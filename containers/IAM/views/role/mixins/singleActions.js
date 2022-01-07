import { mapGetters } from 'vuex'
import i18n from '@/locales'
import {
  getSetPublicAction,
} from '@/utils/common/tableActions'

export default {
  computed: mapGetters(['isAdminMode', 'l3PermissionEnable']),
  created () {
    this.singleActions = [
      {
        label: i18n.t('role.action.set_policies'),
        action: obj => {
          this.sidePageTriggerHandle(this, 'RoleSidePage', {
            id: obj.id,
            resource: 'roles',
            apiVersion: 'v1',
          }, { tab: 'policies-list-for-role-sidepage', list: this.list })
        },
      },
      {
        label: i18n.t('common.more'),
        actions: obj => {
          return [
            // {
            //   label: i18n.t('system.text_435'),
            //   action: () => {
            //     this.onManager('performAction', {
            //       id: obj.id,
            //       managerArgs: {
            //         action: 'public',
            //       },
            //     })
            //   },
            //   meta: () => {
            //     const ret = {
            //       validate: false,
            //     }
            //     if (!this.isAdminMode || !this.l3PermissionEnable) return ret
            //     if (obj.is_public) return ret
            //     ret.validate = true
            //     return ret
            //   },
            // },
            // {
            //   label: i18n.t('system.text_436'),
            //   action: () => {
            //     this.onManager('performAction', {
            //       id: obj.id,
            //       managerArgs: {
            //         action: 'private',
            //       },
            //     })
            //   },
            //   meta: () => {
            //     const ret = {
            //       validate: false,
            //     }
            //     if (!this.isAdminMode || !this.l3PermissionEnable) return ret
            //     if (!obj.is_public) return ret
            //     ret.validate = true
            //     return ret
            //   },
            // },
            getSetPublicAction(this, {
              name: this.$t('dictionary.role'),
              scope: 'domain',
              resource: 'roles',
              apiVersion: 'v1',
              noCandidateDomains: true,
            }, {
              permission: 'roles_perform_public',
            }),
            {
              label: i18n.t('system.text_129'),
              permission: 'roles_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('system.text_129'),
                  onManager: this.onManager,
                  name: this.$t('dictionary.role'),
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
