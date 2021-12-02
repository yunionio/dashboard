import {
  getEnabledTableColumn,
  getProjectDomainTableColumn,
  getNameDescriptionTableColumn,
  getPublicScopeTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        field: 'name',
        title: i18n.t('system.text_101'),
        minWidth: 100,
        edit: row => !row.is_system,
        editDesc: row => !row.is_system,
        hideField: true,
        slotCallback: (row, h) => {
          return this.$createElement(
            'side-page-trigger',
            {
              on: {
                trigger: () => this.handleOpenSidepage(row),
              },
            },
            row.name,
          )
        },
      }),
      getEnabledTableColumn(),
      {
        field: 'scope',
        title: i18n.t('system.text_430', [i18n.t('dictionary.policy')]),
        width: 100,
        formatter: ({ row }) => {
          return this.$t(`policyScopeLabel.${row.scope}`)
        },
      },
      getTagTableColumn({
        customTitle: this.$t('common_738'),
        title: this.$t('common_738'),
        field: 'project_tags',
        columns: () => this.columns,
      }),
      getPublicScopeTableColumn({ vm: this, resource: 'policies' }),
      getProjectDomainTableColumn(),
    ]
  },
  methods: {
    isOwnerPublic (obj) {
      // fix by http://bug.yunion.io/zentao/bug-view-2958.html 共享的权限在其他域下时应该不能做任何操作
      if (obj.is_public) {
        if (this.isAdminMode) return true
        if (obj.domain_id !== this.userInfo.domain.id) return false
      }
      return true
    },
  },
}
