import { mapGetters } from 'vuex'
import { getEnabledSwitchActions, getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'
export default {
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_590'),
        action: (row) => {
          this.openSidePageRuleList(row)
        },
        meta: (row) => {
          const ret = {
            validate: !!row.can_update,
          }
          if (!(this.isAdminMode || row.domain_id === this.userInfo.projectDomainId)) {
            ret.validate = false
            ret.tooltip = this.$t('cloudenv.text_597')
          }
          return ret
        },
      },
      {
        label: i18n.t('cloudenv.text_311'),
        actions: obj => {
          return [
            // 启用禁用
            ...getEnabledSwitchActions(this, obj, ['projectmappings_perform_enable', 'projectmappings_perform_disable'], {
              resourceName: this.$t('cloudenv.text_580'),
              metas: [
                () => {
                  const ret = {
                    validate: !obj.enabled,
                  }
                  return ret
                },
                () => {
                  const ret = {
                    validate: obj.enabled,
                  }
                  return ret
                },
              ],
            }),
            getSetPublicAction(this, {
              name: this.$t('cloudenv.text_580'),
              scope: 'domain',
              resource: 'project_mappings',
            }, {
              permission: 'project_mappings_perform_public',
            }),
            // 删除
            {
              label: i18n.t('cloudenv.text_108'),
              permission: 'projectmappings_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('resourceowner_delete'),
                  name: this.$t('cloudenv.text_580'),
                  onManager: this.onManager,
                })
              },
              meta: (row) => {
                const ret = {
                  validate: true,
                }
                if (!row.can_delete) {
                  ret.validate = false
                  ret.tooltip = i18n.t('cloudenv.text_596')
                }
                return ret
              },
            },
          ]
        },
        meta: (row) => {
          const ownerDomain = this.isAdminMode || row.domain_id === this.userInfo.projectDomainId
          const ret = {
            validate: true,
          }
          if (!ownerDomain) {
            ret.validate = false
            ret.tooltip = this.$t('cloudenv.text_597')
          }
          return ret
        },
      },
    ]
  },
}
