import { mapGetters } from 'vuex'
// import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'
export default {
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_757'),
        action: (row) => {
          this.openSidePageWafRuleList(row)
        },
      },
      {
        label: i18n.t('network.text_758'),
        action: (row) => {
          this.openSidePageWafResourceList(row)
        },
      },
      {
        label: i18n.t('network.text_201'),
        action: (row) => {
          this.syncWafStatus(row)
        },
      },
      {
        label: i18n.t('cloudenv.text_108'),
        permission: 'billsdimensions_delete',
        action: (row) => {
          this.createDialog('DeleteProjectMappingDialog', {
            data: [row],
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
          return ret
        },
      },
      // {
      //   label: i18n.t('cloudenv.text_311'),
      //   actions: obj => {
      //     return [
      //       // 启用禁用
      //       ...getEnabledSwitchActions(this, obj, ['billsdimensions_perform_enable', 'billsdimensions_perform_disable'], {
      //         metas: [
      //           () => {
      //             const ret = {
      //               validate: !obj.enabled,
      //             }
      //             return ret
      //           },
      //           () => {
      //             const ret = {
      //               validate: obj.enabled,
      //             }
      //             return ret
      //           },
      //         ],
      //       }),
      //       // 删除
      //       {
      //         label: i18n.t('cloudenv.text_108'),
      //         permission: 'billsdimensions_delete',
      //         action: () => {
      //           this.createDialog('DeleteProjectMappingDialog', {
      //             data: [obj],
      //             columns: this.columns,
      //             title: this.$t('resourceowner_delete'),
      //             name: this.$t('cloudenv.text_580'),
      //             onManager: this.onManager,
      //           })
      //         },
      //         meta: (row) => {
      //           const ret = {
      //             validate: true,
      //           }
      //           return ret
      //         },
      //       },
      //     ]
      //   },
      //   meta: (row) => {
      //     const ownerDomain = this.isAdminMode
      //     const ret = {
      //       validate: true,
      //     }
      //     if (!ownerDomain) {
      //       ret.validate = false
      //       ret.tooltip = this.$t('cloudenv.text_597')
      //     }
      //     return ret
      //   },
      // },
    ]
  },
}
