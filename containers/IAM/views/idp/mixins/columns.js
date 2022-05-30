import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    const driverOptions = Object.keys(this.$t('idpDrivers')).reduce((prev, current) => {
      prev[current.toLowerCase()] = current
      return prev
    }, {})
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'idp' }),
      getEnabledTableColumn(),
      getStatusTableColumn({ title: i18n.t('system.text_203'), field: 'sync_status', statusModule: 'sync', minWidth: 120 }),
      getEnabledTableColumn({
        title: i18n.t('common_501'),
        field: 'auto_create_user',
        minWidth: 130,
      }),
      {
        field: 'driver',
        title: i18n.t('system.text_204'),
        minWidth: 80,
        showOverflow: 'ellipsis',
        formatter: ({ cellValue }) => {
          return driverOptions[cellValue] || cellValue
        },
      },
      getCopyWithContentTableColumn({
        field: 'template',
        title: i18n.t('common_550'),
        hideField: true,
        message: (row) => {
          const v = row.template || row.driver
          return this.$t('idpTmplTitles')[v] ? this.$t(`idpTmplTitles.${v}`) : v || '-'
        },
        slotCallback: (row) => {
          const v = row.template || row.driver
          return this.$t('idpTmplTitles')[v] ? this.$t(`idpTmplTitles.${v}`) : v || '-'
        },
      }),
      {
        minWidth: 120,
        field: 'project_domain',
        title: this.$t('common_548'),
        slots: {
          default: ({ row }, h) => {
            if (!row.project_domain) return this.$t('system.text_15')
            return [
              <list-body-cell-wrap copy field={'project_domain'} row={row} hideField={true} message={row.project_domain}>
                {row.project_domain}
              </list-body-cell-wrap>,
            ]
          },
        },
      },
      getTimeTableColumn(),
    ]
  },
}
