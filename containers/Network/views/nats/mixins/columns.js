import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getTimeTableColumn,
  getBillingTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

const NatSpec = {
  default: '-',
  small: i18n.t('network.nat.spec.small'),
  medium: i18n.t('network.nat.spec.medium'),
  large: i18n.t('network.nat.spec.large'),
  xlarge: i18n.t('network.nat.spec.xlarge.1'),
  'xlarge.1': i18n.t('network.nat.spec.xlarge.1'),
}

export const getNatSpecColumn = ({ field = 'nat_spec', title = i18n.t('network.text_268') } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        const spec = row.nat_spec && row.nat_spec.toLowerCase()
        return NatSpec[spec] || spec
      },
    },
  }
}

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'nat' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'natgateways', columns: () => this.columns }),
      getNatSpecColumn({}),
      getBillingTableColumn({ vm: this }),
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
