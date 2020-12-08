import { mapGetters } from 'vuex'
import { getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
  },
  created () {
    this.singleActions = [
      // {
      //   label: `关联${this.$t('dictionary.server')}`,
      //   permission: 'server_perform_assign_secgroup',
      //   action: (obj) => {
      //     this.createDialog('SetServerDialog', {
      //       data: [obj],
      //       columns: this.columns,
      //       title: `关联${this.$t('dictionary.server')}`,
      //       onManager: this.onManager,
      //       refresh: this.refresh,
      //     })
      //   },
      // },
      {
        label: i18n.t('compute.text_1027'),
        action: (obj) => {
          this.sidePageTriggerHandle(this, 'SecGroupSidePage', {
            id: obj.id,
            resource: 'secgroups',
          }, { tab: 'in-direction' })
        },
      },
      {
        label: i18n.t('compute.text_352'),
        actions: obj => {
          return [
            // {
            //   label: '设置为私有',
            //   permission: 'secgroups_create',
            //   action: () => {
            //     this.onManager('performAction', {
            //       id: obj.id,
            //       managerArgs: {
            //         action: 'private',
            //       },
            //     })
            //   },
            //   meta: () => {
            //     if (this.$store.getters.isAdminMode || this.$store.getters.isDomainMode) {
            //       if (this.isPower(obj)) {
            //         return {
            //           validate: obj.is_public,
            //         }
            //       }
            //     }
            //     return {
            //       validate: false,
            //     }
            //   },
            // },
            // {
            //   label: '设置为共享',
            //   permission: 'secgroups_create',
            //   action: () => {
            //     this.createDialog('SetPublicDialog', {
            //       data: [obj],
            //       title: '设置为共享',
            //       columns: this.columns,
            //       onManager: this.onManager,
            //       refresh: this.refresh,
            //     })
            //   },
            //   meta: () => {
            //     if (this.$store.getters.isAdminMode || this.$store.getters.isDomainMode) {
            //       if (this.isPower(obj)) {
            //         return {
            //           validate: !obj.is_public,
            //         }
            //       }
            //     }
            //     return {
            //       validate: false,
            //     }
            //   },
            // },
            {
              label: i18n.t('compute.text_1028'),
              action: (obj) => {
                this.sidePageTriggerHandle(this, 'SecGroupSidePage', {
                  id: obj.id,
                  resource: 'secgroups',
                }, { tab: 'vminstance-list' })
              },
              hidden: () => this.hiddenActions.includes('openSecgroupSidepageTab'),
            },
            {
              label: i18n.t('compute.text_983'),
              // permission: 'secgroups_create',
              action: () => {
                this.createDialog('CloneSecgroupDialog', {
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('compute.text_983'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                return {
                  validate: this.isPower(obj),
                }
              },
            },
            {
              label: i18n.t('compute.import_secgroup_rule', []),
              permission: 'secgroups_update',
              action: () => {
                this.createDialog('ImportSecgroupRuleDialog', {
                  data: [obj],
                  exportDataOptions: this.exportDataOptions,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
            },
            {
              label: i18n.t('compute.text_1012'),
              permission: 'secgroups_create',
              action: () => {
                this.createDialog('ConcatSecgroupDialog', {
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('compute.text_1012'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                return {
                  validate: this.isPower(obj),
                }
              },
            },
            {
              label: this.$t('compute.text_279', [this.$t('dictionary.project')]),
              permission: 'secgroups_create',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.secgroup'),
                  resource: 'secgroups',
                })
              },
              meta: () => {
                if (!this.isProjectMode) {
                  const isPower = this.isPower(obj)
                  const isPrivate = !obj.is_public
                  return {
                    validate: isPower && isPrivate,
                    tooltip: isPower && !isPrivate ? i18n.t('compute.text_1378') : '',
                  }
                }
                return {
                  tooltip: i18n.t('compute.text_1336'),
                  validate: false,
                }
              },
            },
            getSetPublicAction(this, {
              name: this.$t('dictionary.secgroup'),
              scope: 'project',
              resource: 'secgroups',
            }, {
              permission: 'secgroups_performAction',
            }),
            {
              label: i18n.t('compute.text_261'),
              permission: 'secgroups_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('compute.text_261'),
                  name: this.$t('dictionary.secgroup'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                return {
                  validate: this.isPower(obj) && this.$getDeleteResult(obj).validate,
                  tooltip: !this.$getDeleteResult(obj).validate ? this.$getDeleteResult(obj).tooltip : '',
                }
              },
            },
          ]
        },
      },
    ]
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
