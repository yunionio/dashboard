import { mapGetters } from 'vuex'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'
export default {
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_590'),
        // permission: 'proxysettings_update',
        action: (row) => {
          this.sidePageTriggerHandle(this, 'ProjectMappingSidePage', {
            id: row.id,
            resource: 'project_mappings',
          }, { tab: 'rule-list' })
          this.initSidePageTab('rule-list')
        },
        meta: (row) => {
          if (!row.can_update) {
            return {
              validate: false,
            }
          }
          return {
            validate: this.isAdminMode || row.domain_id === this.userInfo.projectDomainId,
          }
        },
      },
      {
        label: i18n.t('cloudenv.text_311'),
        actions: obj => {
          const ownerDomain = this.isAdminMode || obj.domain_id === this.userInfo.projectDomainId
          return [
            // 修改
            {
              label: i18n.t('cloudenv.text_593'),
              permission: 'projectmappings_update',
              action: () => {
                this.createDialog('ProjectMappingUpdateDialog', {
                  data: [obj],
                  columns: this.columns,
                  success: (res) => {
                    this.list.fetchData()
                  },
                })
              },
              meta: () => {
                if (!obj.can_update) {
                  return {
                    validate: false,
                  }
                }
                return {
                  validate: ownerDomain,
                }
              },
            },
            // 启用禁用
            ...getEnabledSwitchActions(this, obj, ['projectmappings_perform_enable', 'projectmappings_perform_disable'], {
              metas: [
                () => {
                  return {
                    validate: !obj.enabled && ownerDomain,
                  }
                },
                () => {
                  return {
                    validate: obj.enabled && ownerDomain,
                  }
                },
              ],
            }),
            // 删除
            {
              label: i18n.t('cloudenv.text_108'),
              permission: 'projectmappings_delete',
              action: () => {
                this.createDialog('DeleteProjectMappingDialog', {
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('resourceowner_delete'),
                  name: this.$t('cloudenv.text_580'),
                  onManager: this.onManager,
                })
              },
              meta: this.commonMeta,
            },
          ]
        },
      },
    ]
  },
  methods: {
    commonMeta (row = {}) {
      // 不可删
      if (!row.can_delete) {
        return {
          validate: false,
          tooltip: i18n.t('cloudenv.text_596'),
        }
      }
      // 启用状态不可删
      // if (row.enabled) {
      //   return {
      //     validate: false,
      //     tooltip: i18n.t('cloudenv.text_595'),
      //   }
      // }
      // 域管理且非本域成员不可删
      const { isDomainMode, userInfo } = this.$store.getters
      if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
        return {
          validate: false,
          tooltip: i18n.t('cloudenv.text_597'),
        }
      }
      return {
        validate: true,
      }
    },
  },
}
