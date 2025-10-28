import { mapGetters } from 'vuex'
import { getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'
// import { exportDataOptions } from '../utils'

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
        permission: 'secgrouprules_list',
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
              label: i18n.t('compute.perform_sync_status'),
              permission: 'secgroups_perform_sync_status',
              action: () => {
                this.onManager('performAction', {
                  steadyStatus: ['ready', 'delete_failed'],
                  id: obj.id,
                  managerArgs: {
                    action: 'syncstatus',
                  },
                })
              },
            },
            {
              label: i18n.t('compute.text_1028_1'),
              permission: 'servers_list',
              action: (obj) => {
                this.sidePageTriggerHandle(this, 'SecGroupSidePage', {
                  id: obj.id,
                  resource: 'secgroups',
                }, { tab: 'associated-instances' })
              },
              hidden: () => this.hiddenActions.includes('openSecgroupSidepageTab'),
            },
            // {
            //   label: i18n.t('compute.text_983'),
            //   permission: 'secgroups_perform_clone',
            //   action: () => {
            //     this.createDialog('CloneSecgroupDialog', {
            //       data: [obj],
            //       columns: this.columns,
            //       title: i18n.t('compute.text_983'),
            //       onManager: this.onManager,
            //       refresh: this.refresh,
            //     })
            //   },
            //   meta: () => {
            //     const isPrivate = !obj.is_public
            //     return {
            //       validate: this.isPower(obj),
            //       tooltip: !isPrivate ? i18n.t('compute.secgroup.shared') : '',
            //     }
            //   },
            // },
            // {
            //   label: i18n.t('compute.import_secgroup_rule', []),
            //   permission: 'secgroups_perform_import_rules',
            //   action: () => {
            //     this.createDialog('ImportSecgroupRuleDialog', {
            //       data: [obj],
            //       exportDataOptions,
            //       onManager: this.onManager,
            //       refresh: this.refresh,
            //       a: 1,
            //     })
            //   },
            //   meta: () => {
            //     const isPrivate = !obj.is_public
            //     return {
            //       validate: this.isPower(obj),
            //       tooltip: !isPrivate ? i18n.t('compute.secgroup.shared') : '',
            //     }
            //   },
            // },
            // {
            //   label: i18n.t('compute.text_1012'),
            //   permission: 'secgroups_perform_merge',
            //   action: () => {
            //     this.createDialog('ConcatSecgroupDialog', {
            //       data: [obj],
            //       columns: this.columns,
            //       title: i18n.t('compute.text_1012'),
            //       onManager: this.onManager,
            //       refresh: this.refresh,
            //     })
            //   },
            //   meta: () => {
            //     const isPrivate = !obj.is_public
            //     return {
            //       validate: this.isPower(obj),
            //       tooltip: !isPrivate ? i18n.t('compute.secgroup.shared') : '',
            //     }
            //   },
            // },
            {
              label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
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
                    tooltip: isPower && !isPrivate ? i18n.t('compute.secgroup.shared') : '',
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
              permission: 'secgroups_perform_public',
            }),
            {
              label: i18n.t('compute.perform_delete'),
              permission: 'secgroups_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  alert: this.$t('compute.text_1395'),
                  columns: this.columns,
                  title: i18n.t('compute.perform_delete'),
                  name: this.$t('dictionary.secgroup'),
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
  methods: {
    isPower (obj) {
      if (!obj.domain_id && obj.data.domain_id) {
        obj = obj.data
      }
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
