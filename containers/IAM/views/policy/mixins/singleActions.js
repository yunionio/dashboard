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
        label: i18n.t('system.text_152'),
        action: obj => {
          this.$router.push({
            path: '/policy/update',
            query: {
              policyName: obj.type,
              id: obj.id,
            },
          })
        },
        meta: (obj) => {
          const ret = {
            validate: true,
          }
          const ownerDomain = this.$store.getters.isAdminMode || obj.domain_id === this.$store.getters.userInfo.projectDomainId
          if (!ownerDomain) {
            ret.validate = false
            return ret
          }
          if (obj.is_system) {
            ret.validate = false
            ret.tooltip = this.$t('policy.tooltip.system_policy')
            return ret
          }
          return ret
        },
      },
      {
        label: i18n.t('system.text_153'),
        actions: obj => {
          return [
            {
              label: i18n.t('system.text_225'),
              action: () => {
                this.createDialog('DisableDialog', {
                  title: i18n.t('system.text_342', i18n.t('dictionary.policy')),
                  name: this.$t('dictionary.policy'),
                  columns: this.columns,
                  data: [obj],
                  ok: async () => {
                    try {
                      const response = await this.onManager('update', {
                        id: obj.id,
                        managerArgs: {
                          data: { enabled: true },
                        },
                      })
                      return response
                    } catch (error) {
                      throw error
                    }
                  },
                })
              },
              meta: () => {
                return {
                  validate: !obj.enabled && this.isOwnerPublic(obj),
                }
              },
            },
            {
              label: i18n.t('system.text_226'),
              action: () => {
                this.createDialog('DisableDialog', {
                  alert: i18n.t('system.text_434'),
                  title: i18n.t('system.text_341', [i18n.t('dictionary.policy')]),
                  name: this.$t('dictionary.policy'),
                  columns: this.columns,
                  data: [obj],
                  ok: async () => {
                    try {
                      const response = await this.onManager('update', {
                        id: obj.id,
                        managerArgs: {
                          data: { enabled: false },
                        },
                      })
                      return response
                    } catch (error) {
                      throw error
                    }
                  },
                })
              },
              meta: () => {
                return {
                  validate: obj.enabled && this.isOwnerPublic(obj),
                }
              },
            },
            {
              label: this.$t('table.action.clone'),
              action: () => {
                this.createDialog('PolicyCloneDialog', {
                  data: [obj],
                  columns: this.columns,
                  success: () => {
                    this.refresh()
                  },
                })
              },
            },
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
            //     if (!this.isAdminMode || !this.l3PermissionEnable) {
            //       return ret
            //     }
            //     if (obj.is_system) {
            //       ret.tooltip = this.$t('policy.tooltip.system_policy')
            //       return ret
            //     }
            //     ret.validate = !obj.is_public && this.isOwnerPublic(obj)
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
            //     if (!this.isAdminMode || !this.l3PermissionEnable) {
            //       return ret
            //     }
            //     if (obj.is_system) {
            //       ret.tooltip = this.$t('policy.tooltip.system_policy')
            //       return ret
            //     }
            //     ret.validate = obj.is_public && this.isOwnerPublic(obj)
            //     return ret
            //   },
            // },
            getSetPublicAction(this, {
              name: this.$t('res.policy'),
              scope: 'domain',
              resource: 'policies',
              apiVersion: 'v1',
              noCandidateDomains: true,
            }, {
              meta: row => {
                const ret = {
                  validate: false,
                }
                if (obj.is_system) {
                  ret.tooltip = this.$t('policy.tooltip.system_policy')
                  return ret
                }
              },
            }),
            {
              label: i18n.t('system.text_129'),
              permission: 'policies_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('system.text_129'),
                  onManager: this.onManager,
                  name: this.$t('dictionary.policy'),
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
