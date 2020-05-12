import { mapGetters } from 'vuex'
import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  created () {
    this.singleActions = [
      {
        label: `关联${this.$t('dictionary.server')}`,
        permission: 'server_perform_assign_secgroup',
        action: (obj) => {
          this.createDialog('SetServerDialog', {
            data: [obj],
            columns: this.columns,
            title: `关联${this.$t('dictionary.server')}`,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
      {
        label: '更多',
        actions: obj => {
          return [
            {
              label: `更改${this.$t('dictionary.project')}`,
              permission: 'secgroups_create',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.secgroup'),
                })
              },
              meta: () => {
                if (this.$store.getters.isAdminMode || this.$store.getters.isDomainMode) {
                  return {
                    validate: this.isPower(obj),
                  }
                }
                return {
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
              label: '克隆',
              // permission: 'secgroups_create',
              action: () => {
                this.createDialog('CloneSecgroupDialog', {
                  data: [obj],
                  columns: this.columns,
                  title: '克隆',
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const pArr = this.$store.getters.permission && this.$store.getters.permission['secgroups_create']
                const val = pArr[pArr.length - 1]
                if (val === 'deny') {
                  return {
                    validate: false,
                  }
                }
                if (val === 'guest' || val === 'user' || val === 'allow') {
                  const isSystemResource = this.$store.getters.scopeResource && this.$store.getters.scopeResource.system.includes(pArr[1])
                  const isDomainResource = this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes(pArr[1])
                  if (isSystemResource) {
                    if (!this.$store.getters.isAdminMode) {
                      return {
                        validate: false,
                      }
                    }
                  }
                  if (isDomainResource) {
                    if (!this.$store.getters.isDomainMode && !this.$store.getters.isAdminMode) {
                      return {
                        validate: false,
                      }
                    }
                  }
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: '合并安全组',
              permission: 'secgroups_create',
              action: () => {
                this.createDialog('ConcatSecgroupDialog', {
                  data: [obj],
                  columns: this.columns,
                  title: '合并安全组',
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
              label: '删除',
              permission: 'secgroups_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: '删除',
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
