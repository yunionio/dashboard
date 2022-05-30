import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getProjectDomainTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: i18n.t('system.text_168') },
        ],
        edit: row => row.idp_driver !== 'ldap',
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'displayname',
        title: i18n.t('scope.text_245'),
        slots: {
          default: ({ row }) => {
            return [<list-body-cell-wrap copy row={ row } field='displayname' title={ row.displayname || '-' } />]
          },
        },
      },
      getEnabledTableColumn(),
      getEnabledTableColumn({
        field: 'allow_web_console',
        title: i18n.t('system.text_512'),
      }),
      getEnabledTableColumn({
        field: 'enable_mfa',
        title: 'MFA',
      }),
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
