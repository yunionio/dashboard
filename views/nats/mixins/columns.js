import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

const NatSpec = {
  small: i18n.t('network.text_553'),
  medium: i18n.t('network.text_554'),
  large: i18n.t('network.text_555'),
  'x-large': i18n.t('network.text_556'),
}
const BillingType = {
  postpaid: i18n.t('network.text_533'),
  prepaid: i18n.t('network.text_534'),
}

export default {
  created () {
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
      getStatusTableColumn({ statusModule: 'nat' }),
      {
        field: 'nat_spec',
        title: i18n.t('network.text_536'),
        showOverflow: 'ellipsis',
        minWidth: 100,
        formatter: ({ cellValue }) => {
          const spec = cellValue && cellValue.toLowerCase()
          return NatSpec[spec] || spec
        },
      },
      getCopyWithContentTableColumn({ field: 'vpc', title: i18n.t('network.text_535') }),
      {
        field: 'billing_type',
        title: i18n.t('network.text_537'),
        showOverflow: 'ellipsis',
        minWidth: 100,
        formatter: ({ cellValue }) => {
          return BillingType[cellValue]
        },
      },
      getBrandTableColumn(),
      getAccountTableColumn(),
      getPublicScopeTableColumn({ vm: this, resource: 'natgateways' }),
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
      {
        field: 'region',
        title: i18n.t('network.text_199'),
        width: 150,
      },
    ]
  },
}
